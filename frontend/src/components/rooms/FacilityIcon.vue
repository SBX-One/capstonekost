<script setup>
import { computed } from 'vue';
import {
    Home,
    AirVent,
    Bed,
    BedDouble,
    ShowerHead,
    Wifi,
    Table,
    Tv,
    Fan,
    Sofa,
    Refrigerator,
    GlassWater,
    WashingMachine,
    Shirt,
    Dumbbell,
    Microwave,
    DoorClosed,
    Chair,
    Utensils,
    Lamp,
    Zap,
    Camera,
    Bath,
} from 'lucide-vue-next';

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
});

const iconMap = new Map([
    ['home', Home],
    ['airconditioner', AirVent],
    ['bed', Bed],
    ['beddouble', BedDouble],
    ['shower', ShowerHead],
    ['wifi', Wifi],
    ['table', Table],
    ['monitor', Tv],
    ['fan', Fan],
    ['sofa', Sofa],
    ['refrigerator', Refrigerator],
    ['glass', GlassWater],
    ['washingmachine', WashingMachine],
    ['hanger', Shirt],
    ['wardrobe', Shirt],
    ['dumbbell', Dumbbell],
    ['microwave', Microwave],
    ['door', DoorClosed],
    ['chair', Chair],
    ['cup', Utensils],
    ['lamp', Lamp],
    ['camera', Camera],
    ['bath', Bath],

    ['ac', AirVent],
    ['privatebathroom', ShowerHead],
    ['privatekitchen', Microwave],
    ['desk', Table],
    ['water', GlassWater],
    ['electricity', Zap],
]);

const resolvedIcon = computed(() => {
    if (!props.name) return iconMap.get('home');

    const cleanName = props.name.replace(/\s+/g, '').toLowerCase();
    return iconMap.get(cleanName) || iconMap.get('home');
});
</script>

<template>
    <component :is="resolvedIcon" v-bind="$attrs" />
</template>
