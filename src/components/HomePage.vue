<template>
  <div>
    <input type="file" accept="image/*" @change="handleFileUpload">
    <button @click="uploadImage">Predict Image</button>
    <div v-if="imagePreview">
      <br />
      <img :src="imagePreview" alt="Selected Image" class="image-preview">
      <br />
    </div>
    <div v-if="uploadStatus">{{ uploadStatus }}</div>
    <div v-if="predictionResult">
      <h3>Prediction:</h3>
      <p>{{ predictionResult }}</p>
    </div>
    <div>{{ errorStatus }}</div>
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

<style scoped>
.image-preview {
  max-width: 400px;
  max-height: 400px;
  width: auto;
  height: auto;
  display: block;
  margin: auto;
}
</style>