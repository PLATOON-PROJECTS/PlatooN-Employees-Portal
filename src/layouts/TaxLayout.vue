<script setup lang="ts">
import { ref } from "vue";
import Card from "../components/cards/Card.vue";
import ButtonBlueOutline from "../components/buttons/ButtonBlueOutline.vue";
import ButtonBlue from "../components/buttons/ButtonBlue.vue";
import { isActiveRoute } from "../core/router";
import { useRouter, useRoute } from "vue-router";
import { request } from "../composables/request.composable";
import handleError from "../composables/handle_error.composable";
import handleSuccess from "../composables/handle_success.composable";
import { useTaxStore, useEmployeeStore } from "../store/index";
import cache from "../composables/swr_cache";
import EmptyState from "../components/EmptyState.vue";
import { IIncDec, IMenuVertical, IUserThree } from "../core/icons";

// initialize route and router
const router = useRouter();
const route = useRoute();
//initialize store

const taxStore = useTaxStore();
const employeeStore = useEmployeeStore();

// variables
const loading = ref(false);
const enrolledData = ref<any>([]);
const remittanceData = ref<any>([]);
const excludedData = ref<any>([]);
const showDownloadModal = ref(false); 


const downloadAsPdf = () => {
  console.log('Downloading as PDF');
  showDownloadModal.value = false; 
};

const downloadToEmail = () => {
  console.log('Downloading to email');
  showDownloadModal.value = false; 
};
// methods
// const fetchEmployee = async () => {
//   loading.value = true;
//   const totalEmployeeCached = cache("total_employees");
//   if (typeof totalEmployeeCached !== "undefined") {
//     loading.value = false;

//     enrolledData.value.length = 0;
//     excludedData.value.length = 0;

//     totalEmployeeCached.forEach((data: any) => {
//       data.meta.tax
//         ? enrolledData.value.push(data)
//         : excludedData.value.push(data);
//     });
//   }

//   const response = await request(employeeStore.index(), loading);

//   const successResponse = handleSuccess(response);

//   if (successResponse && typeof successResponse !== "undefined") {
//     cache("total_employees", successResponse.data.data);

//     enrolledData.value.length = 0;
//     excludedData.value.length = 0;

//     successResponse.data.data.forEach((data: any) => {
//       data.meta.tax
//         ? enrolledData.value.push(data)
//         : excludedData.value.push(data);
//     });
//   }
// };
// fetchEmployee();
</script>
<template>
  <div :class="[!route.meta?.showTaxCards ? 'space-y-6' : '', 'px-6 py-9']">

    <div
      
    class="w-full flex justify-between"
  >
    <div class="pt-2">
      <h3 class="font-bold text-2xl">Tax & NHF</h3>
    </div>
    <!-- buttons -->
    <div v-if="enrolledData && enrolledData[0]" class="text-sm whitespace-nowrap pr-10"> 
      <ButtonBlue  @click="showDownloadModal = !showDownloadModal">
        <template v-slot:placeholder>Download</template>
      </ButtonBlue>
      <div v-if="showDownloadModal" class="absolute grid bg-white shadow-lg rounded-lg p-4 mt-2 z-10">
        <button @click="downloadAsPdf" class="block w-full text-left font-medium mb-2 hover:text-[#003b3d]">Download as PDF</button>
        <button @click="downloadToEmail" class="block w-full text-left font-medium mb-2 hover:text-[#003b3d]">Download to Email</button>
      </div>
    </div>
  </div>
  <!-- cards -->
  <div class="grid lg:grid-cols-3 gap-6">
   
  </div>
  <!-- end of cards -->
  <div class="bg-white h-full relative rounded-lg py-6 space-y-5">
    <div class="px-5 py-2 flex justify-between">
      <div class="space-y-6">
        <div>
          <h3 class="font-bold text-2xl">All History</h3>
          <p class="text-sm pt-1 text-black-200 font-semimedium">
            Your full activity history
          </p>
        </div>

        <div class="flex space-x-6">
          <div class="relative cursor-pointer">
            <div class="flex space-x-2 text-blue">
              <span
              class="text-sm pt-1 font-semimedium whitespace-nowrap text-black-200 "
                >Sort by month</span
              >
              <span class="pt-2">
                <IIncDec />
              </span>
              <!-- <CalenderInterface
                v-if="openCalender == true"
                class="absolute top-[30px] w-full"
              /> -->
            </div>
          </div>
        
          <!--  -->
        </div>
      </div>
     
    </div>

    <spinner
      v-if="loading == true"
      class="flex justify-center items-center lg:h-[400px] h-[300px]"
    />
    <div v-else>
      <div class="space-y-10 overflow-auto scrollbar-hide">
        <!-- table -->
        <div class="border-t border-grey">
          <div class="py-6">
            <div class="align-middle inline-block min-w-full">
              <div class="sm:rounded-lg">
                <table class="min-w-full table-fixed">
                  <thead
                    v-if="enrolledData && enrolledData[0]"
                    class="text-black-200 text-sm text-left"
                  >
                    <tr>
                      <th
                        scope="col"
                        class="py-4 text-left flex items-center space-x-3 whitespace-nowrap"
                      >
                        <!-- <CheckBox customClasses="indeterminate-check" /> -->
                        <span> Month </span>
                      </th>
                      <th scope=" col" class="py-4 text-left whitespace-nowrap">
                        Salary
                      </th>
                      <th scope="col" class="py-4 text-left whitespace-nowrap">
                        State
                      </th>
                      <th scope="col" class="py-4 text-left whitespace-nowrap">
                        Tax Value
                      </th>
                      <th scope="col" class="py-4 text-left whitespace-nowrap">
                        Tax ID
                      </th>
                      <th scope="col" class="py-4 text-left whitespace-nowrap">
                        BVN
                      </th>
                      <th scope="col" class="py-4 text-left whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    v-if="enrolledData && enrolledData[0]"
                    class="bg-white divide-y divide-grey-200"
                  >
                    <tr
                      v-for="pension in enrolledData"
                      :key="pension.id"
                      class="text-black-100"
                    >
                    <td class="text-left whitespace-nowrap">
                      <div class="font-normal mb-4">
                        <span class="text-sm font-semimedium">___</span>
                      </div>
                    </td>
                    <td class="text-left whitespace-nowrap">
                      <div class="font-normal mb-4">
                        <span class="text-sm font-semimedium">___</span>
                      </div>
                    </td>
                      <td class="whitespace-nowrap">
                        <div class="font-normal text-left flex mb-4">
                          <span class="text-sm font-semimedium">___</span>
                        </div>
                      </td>
                      <td class="whitespace-nowrap">
                        <div class="font-normal text-left mb-4">
                          <span class="text-sm font-semimedium"> ___ </span>
                        </div>
                      </td>
                      <td class="text-left whitespace-nowrap">
                        <div class="font-normal mb-4">
                          <span class="text-sm font-semimedium">___</span>
                        </div>
                      </td>
                      <td class="text-left whitespace-nowrap">
                        <div class="font-normal mb-4">
                          <span class="text-sm font-semimedium">___</span>
                        </div>
                      </td>
                      <td class="text-left whitespace-nowrap">
                        <div class="flex items-center space-x-2 mb-4">
                          <div class="flex w-full justify-between">
                            <div class="text-left">
                              <ButtonLightBlue>
                                <template v-slot:placeholder>
                                  Download</template
                                >
                              </ButtonLightBlue>
                          </div>
                            <!-- <button @click="isOpen = true">
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
                      <td colspan="7">
                        <EmptyState>
                          <template #icon>
                            <IUserThree />
                          </template>
                          <template #heading> Employee's Tax </template>
                          <template #desc>
                            All history of employee's tax will be displayed
                            here.
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
      <div
        v-if="enrolledData && enrolledData[0]"
        class="hidden justify-between lg:space-x-0 space-x-3 items-center px-6 text-sm text-gray-rgba-3 whitespace-nowrap"
      >
        <span class="whitespace-nowrap"> Showing 1-6 of 30 items</span>
        <div class="flex space-x-3">
          <div class="flex">
            <ButtonBlue>
              <template v-slot:placeholder>1</template>
            </ButtonBlue>
          </div>
          <div class="flex">
            <ButtonColorless>
              <template v-slot:placeholder>2</template>
            </ButtonColorless>
          </div>
          <div class="flex">
            <ButtonColorless>
              <template v-slot:placeholder>3</template>
            </ButtonColorless>
          </div>
        </div>
      </div>
    </div>
  </div>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style></style>
