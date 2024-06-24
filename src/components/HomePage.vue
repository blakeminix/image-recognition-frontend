<template>
  <div class="flex flex-col items-center p-4 gap-4 min-h-screen">
    <div class="flex flex-row gap-12 mt-8">
      <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" ref="fileInput">
      <button @click="triggerFileInput" class="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Choose Image
      </button>
      <button @click="uploadImage" class="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Predict Image
      </button>
    </div>
    <div v-if="imagePreview" class="mb-4">
      <img :src="imagePreview" alt="Selected Image" class="max-w-sm max-h-96 w-auto h-auto block m-auto border-2 border-gray-400 rounded">
    </div>
    <div v-if="uploadStatus" class="mb-4 text-gray-700 text-lg">{{ uploadStatus }}</div>
    <div v-if="predictionResult" class="mb-4 text-center">
      <h3 class="text-xl font-semibold">Prediction:</h3>
      <p class="text-gray-700 mt-4 text-lg">{{ predictionResult }}</p>
    </div>
    <div v-if="errorStatus" class="text-red-600">{{ errorStatus }}</div>
  </div>
</template>

<script>
import axios from '@/api/api';

export default {
  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      uploadStatus: '',
      predictionResult: null,
      predictionPolling: null,
      errorStatus: '',
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
        this.uploadStatus = '';
        this.predictionResult = null;
      } else {
        this.selectedFile = null;
        this.imagePreview = null;
        this.uploadStatus = 'Please select a valid image file.';
      }
    },
    uploadImage() {
      if (!this.selectedFile) {
        this.uploadStatus = 'Please select a file.';
        return;
      }
      this.uploadStatus = 'Uploading...';
      this.predictionResult = null;
      this.errorStatus = '';
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          this.uploadStatus = 'Upload successful. Retrieving prediction...';
          const filename = response.data.filename;
          this.startPolling(filename);
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          this.errorStatus = 'Network error. Please try again.';
          this.uploadStatus = 'Error uploading image.';
        });
    },
    startPolling(filename) {
      this.predictionPolling = setInterval(() => {
        axios.get(`/api/retrieve/${filename}`)
          .then(response => {
            if (response.status === 200) {
              this.predictionResult = response.data.predicted_label;
              this.uploadStatus = '';
              clearInterval(this.predictionPolling);
            }
          })
          .catch(error => {
            console.error('Error retrieving prediction:', error);
          });
      }, 2000);
    },
  },
  beforeUnmount() {
    if (this.predictionPolling) {
      clearInterval(this.predictionPolling);
    }
  },
};
</script>
