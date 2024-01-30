<template lang="pug">
NConfigProvider(:theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN")
  .h-12
  .mb-10(v-if="seedDetail.error") ❌{{ seedDetail.error }}
  template(v-if="seedDetail.id")
    .mb-2.flex  种子id：{{ seedDetail.id }}
    .mb-3.flex  {{ dateText }}
    template(v-if="seedDetail.seed")
      .mb-10.flex  种子为:{{ seedDetail.seed }}
      .text-xl.mb-3 随机数生成
      .flex.flex-wrap.gap-4.mb-8
        .flex.items-center 
          .mr-2 最小值: 
          NInputNumber(:show-button="false" :min="0" v-model:value="rngRange.min")
        .flex.items-center
          .mr-2 最大值 
          NInputNumber(:show-button="false" :min="rngRange.min" v-model:value="rngRange.max")
        .flex.items-center
          .mr-2 数量 
          NInputNumber(:show-button="false" v-model:value="rngRange.q")
      .flex.justify-center.mb-8
        NButton(type="default" @click="rngGen" ) 生成随机数
      .flex.flex-wrap.gap-4.justify-center
        .rounded-sm.bg-gray-100.text-gray-900.text-2xl.w-10.h-10.flex.justify-center.items-center(v-for="(n,i) in rngNums") {{ n }}

  .w-full.my-10(class="h-[1px] bg-white")
  SeedGen
</template>
<script setup>
import { NConfigProvider, NInputNumber,NButton } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui'
import SeedGen from "./components/seedGen.vue";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from 'dayjs'
import rs from 'random-seed'

const id = ref('');
const seedDetail = reactive({})
const rngRange = reactive({
  min:0,
  max:10,
  q:1,
})
const rngNums = ref([])
onMounted(() => {
  const sp = new URLSearchParams(window.location.search)
  id.value = sp.get('id');
  if (id.value) {
    getSeed(id.value)
  }
})
const dateText = computed(()=>{
  let now = Date.now()
  return `种子解锁日期 ${dayjs(seedDetail.stamp).format('YYYY-MM-DD HH:mm:ss')} ${
    seedDetail.seed?'已经开奖了':'还没开奖'
  }`
})
async function getSeed (id) {
  try {
    const res = await fetch(`/api/getSeed?id=${id}`).then(rsp => rsp.json());
    if(res){
      Object.assign(seedDetail, res);

    }else{
      Object.assign(seedDetail, {
        error:'种子不存在，id瞎写的或种子已过期'
      });
    }
  } catch (err) {
    console.log(err)
  }
}
function rngGen(){
  const rand = rs.create(seedDetail.seed);
  const arr = [];
  let {q,min,max} = rngRange
  while(arr.length<q){
    arr.push(
      rand.intBetween(min, max)
    )
  };
  rngNums.value = arr;
}
</script>
<style scoped></style>