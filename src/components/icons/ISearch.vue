<script lang="ts" setup>
withDefaults(defineProps<{ color?: string }>(), {
    color: 'black'
})
</script>
<template>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6.34375 10.9375C8.88081 10.9375 10.9375 8.88081 10.9375 6.34375C10.9375 3.80669 8.88081 1.75 6.34375 1.75C3.80669 1.75 1.75 3.80669 1.75 6.34375C1.75 8.88081 3.80669 10.9375 6.34375 10.9375Z"
            :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9.59222 9.59229L12.25 12.2501" :stroke="color" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
    </svg>
</template>