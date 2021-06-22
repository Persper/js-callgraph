<template lang="pug">
.hello
  h1 {{ msg }}
</template>
 
<script lang="js">
export default {
  name: 'Hello',
 
  data () {
    return {
      msg: 'Hello World!'
    }
  }
 
}
</script>
 
<style>
h1 {
  font-weight: normal;
}
</style>
