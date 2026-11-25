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
    Armchair,
    Utensils,
    Lamp,
    LampDesk,
    Zap,
    Camera,
    Bath,
} from 'lucide-vue-next';

const props = defineProps({
    name: {
        type: String,
        default: 'home',
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
    ['tv', Tv],
    ['television', Tv],
    ['fan', Fan],
    ['sofa', Sofa],
    ['refrigerator', Refrigerator],
    ['fridge', Refrigerator],
    ['minifridge', Refrigerator],
    ['glass', GlassWater],
    ['washingmachine', WashingMachine],
    ['hanger', Shirt],
    ['wardrobe', Shirt],
    ['dumbbell', Dumbbell],
    ['microwave', Microwave],
    ['door', DoorClosed],
    ['chair', Armchair],
    ['armchair', Armchair],
    ['cup', Utensils],
    ['lamp', Lamp],
    ['lampdesk', LampDesk],
    ['camera', Camera],
    ['bath', Bath],

    ['ac', AirVent],
    ['privatebathroom', ShowerHead],
    ['privatekitchen', Microwave],
    ['desk', LampDesk],
    ['studydesk', LampDesk],
    ['water', GlassWater],
    ['electricity', Zap],
]);

const resolvedIcon = computed(() => {
    if (!props.name) return iconMap.get('home');

    const cleanName = String(props.name)
        .replace(/[\s_-]+/g, '')
        .toLowerCase();
    return iconMap.get(cleanName) || iconMap.get('home');
});
</script>

<template>
    <component :is="resolvedIcon" v-bind="$attrs" />
</template>
