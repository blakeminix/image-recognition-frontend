<template>
  <div>
    <input type="file" @change="handleFileUpload">
    <button @click="uploadImage">Upload Image</button>
    <div v-if="uploadStatus">{{ uploadStatus }}</div>
    <div v-if="predictionResult">
      <h3>Prediction Result:</h3>
      <p>{{ predictionResult }}</p>
    </div>
    <div>{{errorStatus}}</div>
  </div>
</template>

<script>
import axios from '@/api/api';

export default {
  data() {
    return {
      selectedFile: null,
      uploadStatus: '',
      predictionResult: null,
      predictionPolling: null,
      errorStatus: '',
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadImage() {
      if (!this.selectedFile) {
        this.uploadStatus = 'Please select a file.';
        return;
      }
      this.uploadStatus = 'Uploading...';
      this.predictionResult = null;
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
          this.errorStatus = error;
          this.uploadStatus = 'Error uploading image.';
        });
    },
    startPolling(filename) {
      this.predictionPolling = setInterval(() => {
        axios.get(`/api/retrieve/${filename}`)
          .then(response => {
            if (response.status === 200) {
              this.predictionResult = response.data.predicted_label;
              this.uploadStatus = 'Prediction retrieved';
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
