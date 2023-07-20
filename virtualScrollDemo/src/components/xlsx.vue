<template>
  <div>

  </div>
</template>

<script setup lang="ts">

/**
 * 将 file 转为一个 CSF 的 JSON
 * @param {File} file
 * @returns sheet
 */
const analyseExcelToJson = (file) => {
  return new Promise((resolve, reject) => {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = (progressEvent) => {
        const arrayBuffer = reader.result;

        const options = { type: 'array' };
        const workbook = XLSX.read(arrayBuffer, options);

        const sheetName = workbook.SheetNames;
        const sheet = workbook.Sheets[sheetName];

        resolve(sheet);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('入参不是 File 类型'));
    }
  });
};


</script>

<style scoped></style>