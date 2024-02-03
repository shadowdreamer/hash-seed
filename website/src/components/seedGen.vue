<template lang="pug">
.mb-10
  p.mb-1 ⚠生成一个随机数种子，在约定的日期前大家都看不到，约定的日期后通过随机数种子生成伪随机的随机数，一般用于楼层抽奖。 
  p.mb-1 ⚠生成随机数之后会有一串数字，通过这个id在约定日期后获取种子。
  p.mb-1.opacity-40 ⚠命运在生成随机数的那一刻已经决定，影响未来的应该只有分母数量。
.mb-10.flex.items-center
  .mr-5 抽奖时间:
  NDatePicker(v-model:value="stamp" type="datetime")
.flex.justify-center.mb-10
  NButton(type="default" @click="createSeed" :loading="status.loading") 生成随机数种子
.mb-10(v-if="status.id")
  .flex.mb-3.items-center
    span.mr-3 成功生成了一个随机数种子，序号为{{ status.id }} 
    NButton(size="small" @click="copy(status.id)") 复制
  p.mb-3 记录或分享下面的链接,日子到了来看看随机数。
  .flex.items-center
    input.bg-gray-50.text-gray-600.px-2.mr-2.flex-1.rounded-sm(:value="shareUrl")
    NButton(size="small" @click="copy(shareUrl)") 复制
  p.mb-3 种子sha256：{{ status.hash }}
    


</template>
<script setup>
import { NDatePicker, NButton} from 'naive-ui'
import {ref,reactive, computed} from 'vue'
import copy from 'copy-to-clipboard';

const stamp = ref(Date.now())
const status = reactive({
  loading:false,
  id:''
})
const shareUrl = computed(()=>{
  return `${window.location.origin}?id=${status.id}`
})
async function createSeed(){
  status.loading = true
  const res = await fetch('/api/newSeed',{
    method:'post',
    body:JSON.stringify({
      stamp:stamp.value
    })
  }).then(rsp=>rsp.json())
  status.loading = false
  status.id = res.id
  status.hash = res.hash
  window.localStorage.setItem('lastRngId',res.id)
}

</script>
<style scoped lang="scss">


</style>