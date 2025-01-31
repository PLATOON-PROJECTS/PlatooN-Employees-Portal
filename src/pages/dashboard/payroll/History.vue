<script setup lang="ts">
import { ref, inject, computed } from "vue";
import CalenderInterface from "../../../layouts/CalenderLayout.vue";
import { IIncDec, IIncDecBlue, IMenuVertical, IUserThree } from "../../../core/icons";
import FCheckedComponent from "../../../components/forms/FCheckBox.vue";
import ButtonLightBlue from "../../../components/buttons/ButtonLightBlue.vue";
import ButtonBlue from "../../../components/buttons/ButtonBlue.vue";
import { FCheckBoxComp } from "../../../core/form";
import Departments from "../../../components/dropdowns/department.vue";
import successAlert from "../../../components/alerts/SuccessAlert.vue";
import spinner from "../../../components/timer/Spinner.vue";
import confirmAlert from "../../../components/alerts/ConfirmAlert.vue";
import EmptyState from "../../../components/EmptyState.vue";
import { useRouter } from "vue-router";
import { request } from "../../../composables/request.composable";
import handleError from "../../../composables/handle_error.composable";
import handleSuccess from "../../../composables/handle_success.composable";
import { usePayrollStore, useUserStore } from "../../../store/index";
import cache from "../../../composables/swr_cache";
import {currency} from '../../../core/utils/currencyType'
import { getItem } from "../../../core/utils/storage.helper";
import Pagination from "../../../components/Pagination.vue";
import { Payroll } from "../../../service/payroll/interface/payroll.interface";
import { formatNumber, dateFormat, formatDate, formatDatee } from "../../../core/helpers/actions"

// initialize router
const router = useRouter();

// initialize store
const payrollStore = usePayrollStore();
const userStore = useUserStore();

// variables
const openCalender = ref(false);
const showSuccess = ref(false);
const deletePayrollsId = ref<string[]>([]);
const confirmType = ref("");
const deleting = ref(false);
const showConfirm = ref(false);
const confirmMessage = ref({ message: "" });
const deletePayrollId = ref<any>();
const loading = ref(false);
const responseData = ref<any>([]);
const payrollData = ref<any[]>([]); 
const successMessage = ref("Action successful");
const userInfo = ref(getItem(import.meta.env.VITE_USERDETAILS));
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);  
const totalItems = ref(0);
const responseDataa = ref<{ data: Payroll[] }>({
  data: []
});
let allPayrolls: Payroll[] = [];

// poroovide and inject
const render = inject<any>("render");

// methods
const parsedUserInfo = typeof userInfo.value === 'string' ? JSON.parse(userInfo.value) : userInfo.value;
const organisationId = parsedUserInfo?.customerInfo?.organisationId;

// Helper function for date formatting
// const formatDate = (dateString: string) => {
//   const options: Intl.DateTimeFormatOptions = {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   };
//   return new Date(dateString).toLocaleDateString(undefined, options).replace(",", "");
// };

const firstName = computed(() => {
  const userDetails = parsedUserInfo;
  const firstName = userDetails.customerInfo.firstName || '';
  return (firstName);
});

const lastName = computed(() => {
  const userDetails = parsedUserInfo;
  const lastName = userDetails.customerInfo.lastName || '';
  return (lastName);
});

const capitalizeFirstLetter = (name: string | null) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const getCurrentMonthPayrollId = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
  const currentYear = currentDate.getFullYear();

  // Filter payrolls for the current month and year
  const payrolls = allPayrolls.filter((payroll) => {
    const scheduledDate = new Date(payroll.scheduledDate);
    
    // Skip invalid dates
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getFullYear() < 2023) {
      return false; // Skip invalid dates
    }
    
    // Check if it falls in the current month/year
    return scheduledDate.getMonth() + 1 === currentMonth && scheduledDate.getFullYear() === currentYear;
  });

  console.log("ressss:", allPayrolls);

  // Return the payroll ID of the first matching payroll or null
  return payrolls.length > 0 ? payrolls[0].payrollId : null;
};

// Helper function for formatting scheduled date
const formatScheduledDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'long' }); // Get the month name
  return `${month} Salary Payment`; // Return the formatted string
};


// const handlePayroll = (id: any) => {
//   if (deletePayrollsId.value.includes(id)) {
//     deletePayrollsId.value = deletePayrollsId.value.filter((value: any) => {
//       return value !== id;
//     });
//   } else {
//     deletePayrollsId.value.push(id);
//   }
// };


const selectedPayrollId = ref<string | null>(null);

const handlePayroll = (id: string) => {
  // If already selected, deselect it
  if (selectedPayrollId.value === id) {
    selectedPayrollId.value = null;
  } else {
    selectedPayrollId.value = id; 
  }
};

// Computed property to check if a single payroll is selected
const isSinglePayrollSelected = computed(() => {
  return selectedPayrollId.value !== null;
});

// Add a new reactive variable to track the sorting order
const isAscendingOrder = ref(true);

// Method to sort responseData by month
const sortByMonth = () => {
  responseData.value.data.sort((a: any, b: any) => {
    const monthA = new Date(a.scheduledDate).getMonth();
    const monthB = new Date(b.scheduledDate).getMonth();
    return isAscendingOrder.value ? monthA - monthB : monthB - monthA;
  });

  // Toggle the sorting order for the next click
  isAscendingOrder.value = !isAscendingOrder.value;
};
const confirmRemovePayrolls = () => {
  // console.log("hit",deletePayrollsId.value)
  confirmType.value = "delete";
  confirmMessage.value.message = `Do you really  want to delete multiple Payrolls(${deletePayrollsId.value.length})?  `;
  showConfirm.value = true;
};

const fetchAllPayrolls = async () => {
  loading.value = true;
  allPayrolls = []; // Ensure this is the outer variable
  let page = 1;
  let totalPages = 1;

  do {
    try {
      const response = await request(payrollStore.index(organisationId, null, null, 10, page), loading);
      const successResponse = handleSuccess(response);

      if (successResponse && typeof successResponse.data !== "undefined") {
        const pageItems = successResponse.data.data.pageItems;
        allPayrolls = allPayrolls.concat(pageItems);
        totalPages = successResponse.data.data.numberOfPages; 
        page++;
      } else {
        break;
      }
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      break;
    }
  } while (page <= totalPages);

  console.log("Total Payrolls Fetched:", allPayrolls.length);
  responseDataa.value.data = allPayrolls; 
  loading.value = false;

  // Call the function here after fetching all payrolls
  const payrollId = getCurrentMonthPayrollId();
  console.log("Payroll ID:", payrollId);
};

const fetchPayrollHistory = async (page = 1) => {
  // const userId = Number(localStorage.getItem('userId'));
  const userId = 43;
    if (userId) {
      loading.value = true; 
        try {
            const response = await payrollStore.getPayrollHistory(userId, undefined, undefined, 10, page);
            payrollData.value = response.data.data.pageItems || []; 
            currentPage.value = response.data.data.currentPage;
            totalPages.value = response.data.data.numberOfPages;
            totalItems.value = response.data.data.pageSize * totalPages.value; 
        } catch (error) {
            console.error("Error fetching payroll history:", error);
            payrollData.value = [];
        } finally {
            loading.value = false; 
        }
    } else {
        console.error("User ID is not available.");
    }
};

fetchPayrollHistory(currentPage.value);
const updatePage = (page: number) => {
  fetchPayrollHistory(page);
}
// fetchAllPayrolls();

// navigateToCreateNew();
</script>
<template>
  <div>
    <div class="bg-white h-full rounded-lg py-6 space-y-5">
      <!-- <confirmAlert
        :showConfirm="showConfirm"
        @closeConfirm="showConfirm = false"
      >
        <template #title> Delete</template>
        <template #confirm>
          <span @click="[deleteManyPayrolls(), (showConfirm = false)]">
            CONFIRM</span
          ></template
        >
        <template #message> {{ confirmMessage.message }}</template>
      </confirmAlert> -->

      <!-- successAlert -->
      <successAlert
        :showSuccess="showSuccess"
        @closeSuccess="showSuccess = false"
        v-if="showSuccess == true"
      >
        <template #otherMessage>CLOSE</template>
        {{ successMessage }}</successAlert
      >
      <div class="px-5 py-2 flex justify-between">
        <div class="space-y-6">
          <div>
            <h3 class="font-bold text-2xl">Payroll History</h3>
            <p class="text-sm pt-1 text-black-200 font-semimedium">
              {{ capitalizeFirstLetter(firstName) }} {{ capitalizeFirstLetter(lastName) }}
            </p>
          </div>

          <div class="flex space-x-6">
            <div class="relative cursor-pointer">
              <div class="flex space-x-2 text-blue">
                <span
                @click="sortByMonth()"
                class="text-sm pt-1 font-semimedium text-black-200 whitespace-nowrap"
                  >Sort by year</span
                >
                <span class="pt-2">
                  <IIncDec />
                </span>
                <CalenderInterface
                  v-if="openCalender == true"
                  class="absolute top-[30px] w-full"
                />
              </div>
            </div>
            <!--  -->
            <div class="flex space-x-2">
              <span
                class="text-sm pt-1 font-semimedium text-[#626669] whitespace-nowrap"
                >Sort by month</span
              >
              <span class="pt-2">
                <IIncDec />
              </span>
            </div>
            <!--  -->
          </div>
        </div>

        <div v-if="payrollData" class="flex space-x-4">
          <!-- <div>
            <ButtonBlue :disabled="true">
              <template v-slot:placeholder>Download Csv</template>
            </ButtonBlue>
          </div> -->
          <div>
            <ButtonBlue v-if="isSinglePayrollSelected">
              <template v-slot:placeholder>
                <span>Generate Payslip</span>
              </template>
            </ButtonBlue>
          </div>
        </div>
      </div>
      <div class="space-y-10 overflow-auto scrollbar-hide">
        <!-- table -->
        <div class="border-t border-grey">
          <div class="py-6 space-y-6">
            <!-- <div class="flex space-x-2 items-center px-6">
              <span class="pt-2">
                <FCheckBoxComp
                  :value="false"
                  name="payrolls"
                  @click="addAllPayrollsForDelete()"
                />
              </span>
              <span class="text-sm pt-1 font-semimedium text-[#626669]"
                >Select All</span
              >
            </div> -->
            <div class="align-middle inline-block min-w-full">
              <div class="overflow-hidden sm:rounded-lg">
                <spinner
                  v-if="loading == true"
                  class="flex justify-center items-center lg:h-[400px] h-[300px]"
                />
                <table v-else class="min-w-full table-fixed">
                  <thead
                    v-if="payrollData"
                    class="text-black-200 text-sm text-left"
                  >
                    <tr>
                      <!-- <th
                        scope=" col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        S/N
                      </th> -->
                      <th
                        scope=" col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Month
                      </th>
                      <th
                        scope=" col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Payment Date
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Gross Pay
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Bonus
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Deductions
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Tax
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Net Pay
                      </th>
                      <th
                        scope="col"
                        class="py-4 font-normal text-left whitespace-nowrap"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    v-if="payrollData.length > 0"
                    class="bg-white divide-y divide-grey-200"
                  >
                    <!--  -->
                    <tr v-for="(item, index) in payrollData" :key="item.payroll.id" class="text-black-100">
                    <!-- <tr
                      v-for="(pay, index) in responseData.data"
                      :key="pay.payrollId"
                      class="text-black-100"
                    > -->
                    <!-- <td class="py-4 whitespace-nowrap">
                        <div class="text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >{{ index+1 }}
                          </span>
                          <span class="text-xs text-gray-rgba-3"> </span>
                        </div>
                      </td> -->
                      <td class="py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-3">
                          <FCheckBoxComp
                            :value="selectedPayrollId === item.payroll.id"
                            @click="handlePayroll(item.payroll.id)"
                          />

                          <div class="flex flex-col">
                            <span class="text-sm font-semimedium">{{ item.payroll ? formatDate(item.payroll.createdAt) : '--' }}</span
                            >
                            <span class="text-xs text-gray-rgba-3">₦{{ item.payroll ? item.payroll.totalSalaries : '--' }}/yr</span>

                          </div>
                        </div>
                      </td>
                      <td class="py-4 whitespace-nowrap">
                        <div class="text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >{{ item.transaction ? formatDatee(item.transaction.createdAt) : '--' }}
                          </span>
                          <span class="text-xs text-gray-rgba-3">{{ item.transaction ? capitalizeFirstLetter(item.transaction.transactionType) : '--' }}</span>
                        </div>
                      </td>
                      <td class="py-4 flex whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦{{ formatNumber(item.employeeDetails?.grossPay) || 0 }}
                          </span>
                        </div>
                      </td>
                      <td class="py-4 whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦{{ formatNumber(item.employeeDetails?.bonus?.amount) || 0 }}</span
                          >
                          <span class="text-xs text-gray-rgba-3">{{ capitalizeFirstLetter(item.employeeDetails?.bonus?.reason) || " " }}</span>
                        </div>
                      </td>
                      <td class="py-4 whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium">₦{{ formatNumber(item.employeeDetails?.deduction?.amount) || 0 }}</span>
                          <span class="text-xs text-gray-rgba-3">{{ capitalizeFirstLetter(item.employeeDetails?.deduction?.reason) || " " }}</span>
                        </div>
                      </td>
                      <td class="py-4 whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium">₦{{ formatNumber(item.employeeDetails?.taxAmount) || 0 }}</span>
                          <span class="text-xs text-gray-rgba-3">PAYEE</span>
                        </div>
                      </td>
                      <td class="py-4 flex whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium">₦{{ formatNumber(item.employeeDetails?.netPay) || 0 }}</span>
                        </div>
                      </td>
                      <td class="py-4 text-left whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                          <div class="flex w-full justify-between">
                            <ButtonLightBlue
                              @click="
                                router.push(
                                  `/dashboard/payroll/approved/${item.payroll.id}`
                                )
                              "
                            >
                              <template v-slot:placeholder>View</template>
                            </ButtonLightBlue>
                            <!-- <button>
                              <IMenuVertical />
                            </button> -->
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  <!-- empty state below -->
                  <tbody v-else class="w-full">
                    <tr class="w-full no-hover">
                      <td colspan="8"> <!-- colspan based on table structure -->
                        <EmptyState>
                          <template #icon>
                            <IUserThree />
                          </template>
                          <template #heading> Payroll </template>
                          <template #desc>
                            All payroll history will be displayed here.
                          </template>
                        </EmptyState>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <!-- end of table -->
        <Pagination 
        :currentPage="currentPage" 
        :totalPages="totalPages"
        :pageSize="pageSize"
        :totalItems="totalItems"
        @updatePage="updatePage"
        />
      </div>
    </div>
  </div>
</template>

<style></style>
