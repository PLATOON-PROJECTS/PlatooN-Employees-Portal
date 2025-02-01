<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { IRadioChecked } from "../../../core/icons";
import { FCheckBoxComp } from "../../../core/form";
import { IArrowLeftTail } from "../../../core/icons";
import ButtonBlue from "../../../components/buttons/ButtonBlue.vue";
import ButtonLightBlue from "../../../components/buttons/ButtonLightBlue.vue";
import successAlert from "../../../components/alerts/SuccessAlert.vue";
import spinner from "../../../components/timer/Spinner.vue";
import confirmAlert from "../../../components/alerts/ConfirmAlert.vue";
import { IIncDec, IMenuVertical, IUserThree } from "../../../core/icons";
import ButtonDangerVue from "../../../components/buttons/ButtonDanger.vue";
import EmptyState from "../../../components/EmptyState.vue";
import { useRouter, useRoute } from "vue-router";
import { request } from "../../../composables/request.composable";
import handleError from "../../../composables/handle_error.composable";
import handleSuccess from "../../../composables/handle_success.composable";
import { usePayrollStore } from "../../../store/index";
import ButtonBlueOutline from "../../../components/buttons/ButtonBlueOutline.vue";
import {currency} from '../../../core/utils/currencyType'
import { getItem } from "../../../core/utils/storage.helper";

// initialize router and route
const router = useRouter();
const route = useRoute();

// initialize store
const payrollStore = usePayrollStore();
const loading = ref(false);
// variables
const confirmType = ref("");
const showSuccess = ref(false);
const responseData = ref<any>();
const successMessage = ref("Action successful");
const showConfirm = ref(false);
const failed = ref(false);
const failedMessage = ref('');
const userInfo = ref(getItem(import.meta.env.VITE_USERDETAILS));
const parsedUserInfo = typeof userInfo.value === 'string' ? JSON.parse(userInfo.value) : userInfo.value;
const organisationId = parsedUserInfo?.customerInfo?.organisationId;
const payrollData = ref<any>({ data: [], message: "" });

// compute
// const id = computed(() => {
//   return route.params.id;
// });

const summaryData = ref({
  totalEmployees: "",
  totalSalaries: "",
  executionDate: "", 
  executionMonth: "", 
  accountName: "", 

});
// methods

const { payrollId } = route.params;

console.log("--------", payrollId)
const parsedPayrollId = Number(payrollId);

const month = computed(() => {
  const date = new Date(payrollData.value?.pageItems?.payroll?.scheduledDate);
  return isNaN(date.getTime()) ? "" : date.toLocaleString('default', { month: 'long' }); 
});
const year = computed(() => {
  const date = new Date(payrollData.value?.pageItems?.payroll?.scheduledDate);
  return isNaN(date.getTime()) ? "" : date.getFullYear(); 
});

const formatDate = (dateString: string, format: 'full' | 'monthYear' = 'full') => {
  const date = new Date(dateString);
  if (format === 'monthYear') {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-GB', options);
  
  // Extract day and remove suffix (e.g., "30th" -> "30")
  const day = formattedDate.split(' ')[0].replace(/(\d+)(th|st|nd|rd)/, '$1');
  const monthYear = formattedDate.split(' ').slice(1).join(' ');

  return `${day} ${monthYear}`;
};

const showDownloadModal = ref(false); 

// Existing methods...
const downloadAsPdf = () => {
  console.log('Downloading as PDF');
  showDownloadModal.value = false; 
};

const downloadToEmail = () => {
  console.log('Downloading to email');
  showDownloadModal.value = false; 
};
const fetchPayrollSummary = async () => {
  if (payrollId) {
    try {
      const response = await payrollStore.getPayroll({
        organisationId,
        payrollId: parsedPayrollId
      });
      if (response.succeeded) {
        payrollData.value = response.data;
        responseData.value = payrollData.value.pageItems.employeeSalaries;
        const scheduledDate = payrollData.value.pageItems.payroll.scheduledDate;
        const accountName = payrollData.value.pageItems.employeeSalaries.firstName + " " + payrollData.value.pageItems.employeeSalaries.lastName;
        const formattedExecutionDate = formatDate(scheduledDate, 'full');
        const formattedExecutionMonthYear = formatDate(scheduledDate, 'monthYear');

        console.log("Formatted Execution Date:", formattedExecutionDate);
        console.log("Account name:", accountName);
        console.log("Account name:", payrollData.value.pageItems.employeeSalaries);

        summaryData.value = {
          totalEmployees: payrollData.value.pageItems.totalEmployees,
          totalSalaries: payrollData.value.pageItems.totalSalaries,
          executionDate: formattedExecutionDate,
          executionMonth: formattedExecutionMonthYear,
          accountName: accountName
        };
        console.log(payrollData.value?.pageItems.totalEmployees )
        console.log("-----", payrollData.value)
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
    } finally {
      loading.value = false; 
    }
  } else {
    console.error("Payroll ID is missing from query.");
  }
};

const accountName = computed(() => {
  if (responseData.value && responseData.value.length > 0) {
    const firstEmployee = responseData.value[0];
    return `${firstEmployee.firstName} ${firstEmployee.lastName}`;
  }
  return "";
});

const showFailedMessage = (message:any) => {
  failedMessage.value = '';
  failed.value = true;
  failedMessage.value = message;
}

fetchPayrollSummary();

</script>
<template>
  <div class="space-y-5">
    <!-- successAlert -->
    <successAlert
      :showSuccess="showSuccess"
      @closeSuccess="showSuccess = false"
      v-if="showSuccess == true"
    >
      <template #otherMessage>CLOSE</template>
      {{ successMessage }}</successAlert
    >
    <div class="bg-white h-full rounded-lg py-6 px-5 space-y-7">
      <div
        class="flex justify-between overflow-auto scrollbar-hide lg:space-x-0 space-x-3"
      >
        <div class="flex space-x-5">
          <div class="pt-1">
            <IArrowLeftTail class="cursor-pointer" @click="router.go(-1)" />
          </div>
          <div>
            <h3 class="font-bold text-2xl whitespace-nowrap">
              {{ month }} Salary Payment
            </h3>
            <p class="text-sm pt-1 font-semimedium">
              <span class="text-black-200 whitespace-nowrap"
                >{{ month }}
                {{ year }}
              </span>
            </p>
          </div>
        </div>
        <div class="text-sm whitespace-nowrap pr-10">
          <div v-if="responseData ">
            <div class="flex space-x-4">
              <ButtonBlueOutline>
                <template v-slot:placeholder>Scan QR To Authenticate</template>
              </ButtonBlueOutline>
            <div> 
              <ButtonBlue  @click="showDownloadModal = !showDownloadModal">
                <template v-slot:placeholder>Download</template>
              </ButtonBlue>
              <div v-if="showDownloadModal" class="absolute grid bg-white shadow-lg rounded-lg p-4 mt-2 z-10">
                <button @click="downloadAsPdf" class="block w-full text-left font-medium mb-2 hover:text-[#003b3d]">Download as PDF</button>
                <button @click="downloadToEmail" class="block w-full text-left font-medium mb-2 hover:text-[#003b3d]">Download to Email</button>
              </div>
            </div>
             
            </div>
            
        
          </div>
        </div>
      </div>
      <div class="grid lg:grid-cols-3 gap-3">
        <!-- grid 1 -->

        <div class="h-full rounded-lg p-4 bg-blue-lighter space-y-8">
          <div class="items-center">
            <div class="flex flex-col">
              <span class="text-xl font-semimedium">Payments </span>
            </div>
          </div>
          <div class="space-y-5">
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦  {{ currency(payrollData.pageItems?.totalSalaries) }} </span>
                <span class="text-xs text-gray-rgba-3"
                  >Gross Payment</span
                >
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦ {{ currency(payrollData.pageItems?.totalSalaries) }}</span>
                <span class="text-xs text-gray-rgba-3">Net Payment</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm"
                  >{{ payrollData.pageItems?.totalEmployees }}
                </span>
                <span class="text-xs text-gray-rgba-3">Department</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦0 </span>
                <span class="text-xs text-gray-rgba-3">People HRM</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">Jan 12, 2022 15:32</span>
                <span class="text-xs text-gray-rgba-3">Date created</span>
              </div>
            </div>
          </div>
        </div>
        <!--grid 2  -->
        <div class="h-full rounded-lg p-4 bg-blue-lighter space-y-8">
          <div class="items-center">
            <div class="flex flex-col">
              <span class="text-xl font-semimedium">Deductions </span>
            </div>
          </div>
          <div class="space-y-5">
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3"
                  >Pension Remitted</span
                >
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3">Tax Remitted</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3">Health Insurance</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3">NSITF</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3">Taxes</span>
              </div>
            </div>
          </div>
        </div>
        <!-- grid  3 -->
        <div class="h-full rounded-lg p-4 bg-blue-lighter space-y-8">
          <div class="items-center">
            <div class="flex flex-col">
              <span class="text-xl font-semimedium">Details </span>
            </div>
          </div>
          <div class="space-y-5">
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">219283836362</span>
                <span class="text-xs text-gray-rgba-3">Account Number</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">{{ accountName }} </span>
                <span class="text-xs text-gray-rgba-3">Account Name </span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">Access Bank</span>
                <span class="text-xs text-gray-rgba-3">Bank Name</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">₦800,000</span>
                <span class="text-xs text-gray-rgba-3">Gross Payment</span>
              </div>
            </div>
            <div class="items-center">
              <div class="flex flex-col">
                <span class="text-sm">Jan 12, 2022 15:32</span>
                <span class="text-xs text-gray-rgba-3">Date added</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white h-full rounded-t-lg py-6">
      <div class="px-5">
        <div class="flex justify-between">
          <h3 class="font-bold text-2xl">Salary Breakdown</h3>
        </div>
      </div>
      <div class="space-y-10 overflow-auto scrollbar-hide">
        <!-- table -->
        <div class="">
          <div class="py-6">
            <div class="align-middle inline-block min-w-full">
              <div class="overflow-hidden sm:rounded-lg">
                 <spinner v-if="loading == true"   class="flex justify-center items-center lg:h-[400px] h-[300px]" />
                <div v-else>
                  
                <table class="min-w-full table-fixed">
                  <thead
                    class="text-black-200 font-semimedium text-sm text-left"
                  >
                    <tr>
                      <th scope="col" class="py-4 text-left flex items-center space-x-3">
                        <span> Name </span>
                      </th>
                      <th scope=" col" class="py-4 text-left">Gross Pay</th>
                      <th scope="col" class="py-4 text-left">Bonus</th>
                      <th scope="col" class="py-4 text-left">Deductions</th>
                      <th scope="col" class="py-4 text-left">Tax</th>
                      <th scope="col" class="py-4 text-left">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody
                    class="bg-white divide-y divide-grey-200"
                    v-if="payrollData && payrollData.pageItems"
                  >
                    <tr
                      v-for="(employee, index) in payrollData.pageItems.employeeSalaries"
                      :key="index"
                      class="text-black-100"
                    >
                      <td class="py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-3 flex-shrink-0">
                          <div class="flex flex-col">
                            <span class="text-sm font-semimedium"
                              >{{ employee.firstName }} {{ employee.lastName }}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td class="py-4 whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦{{ currency(employee.grossPay) }}</span>
                             <span class="text-xs text-gray-rgba-3">Net: ₦72,900</span>
                        </div>
                      </td>
                      <td class="py-4 flex whitespace-nowrap">
                        <div class="font-normal text-left flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦ {{employee.bonus.amount ? currency(employee.bonus.amount) : 0}}</span
                          >
                          <span class="text-xs text-gray-rgba-3">Commisions</span>
                        </div>
                      </td>
                      <td class="py-4 items-center text-left whitespace-nowrap">
                        <div class="font-normal flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦ {{
                              employee.deduction.amount ? currency(employee.deduction.amount) : 0
                            }}</span
                          >
                          <span class="text-xs text-gray-rgba-3">Pensions, Health</span>
                        </div>
                      </td>
                      <td class="py-4 items-center text-left whitespace-nowrap">
                        <div class="font-normal flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦ {{ employee.taxAmount ? currency(employee.taxAmount) : 0 }}</span
                          >
                          <span class="text-xs text-gray-rgba-3">LAGIT</span>
                        </div>
                      </td>
                      <td class="py-4 items-center text-left whitespace-nowrap">
                        <div class="font-normal flex flex-col">
                          <span class="text-sm font-semimedium"
                            >₦{{ employee.netPay ? currency(employee.netPay) : 0 }}</span
                          >
                          <span class="text-xs text-gray-rgba-3">Direct deposit</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  
                    <!-- empty state below -->
                  <tbody v-else class="w-full">
                    <tr class="w-full no-hover">
                      <td colspan="6">
                      <EmptyState>
                        <template #icon>
                          <IUserThree />
                        </template>
                        <template #heading> Payroll Payment</template>
                        <template #desc>
                          No transaction has been carried out.
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
        </div>
        <!-- end of table -->
      </div>
    </div>
  </div>
</template>

<style></style>
