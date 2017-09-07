export module ColorUtil {
    export enum Colors {
        Red = '#F44336',
        Pink = '#E91E63',
        Purple = '#9C27B0',
        //DeepPurple = '#673AB7',
        Indigo = '#3F51B5',
        Blue = '#2196F3',
        //LightBlue = '#03A9F4',
        Cyan = '#00BCD4',
        Teal = '#009688',
        Green = '#4CAF50',
        //LightGreen = '#8BC34A',
        // Lime = '#CDDC39',
        // Yellow = '#FFEB3B',
        // Amber = '#FFC107',
        // Orange = '#FF9800',
        DeepOrange = '#FF5722',
        Brown = '#795548',
        Grey = '#9E9E9E',
        BlueGrey = '#607D8B'
    }

    /**
     * TODO improve or create a new method that takes into account the
     * contacts name.
     */
    export function getRandomColor(): string {
        let keys = Object.keys(Colors);
        let len = keys.length;
        let index = Math.floor(Math.random() * len);
        let x = Colors[keys[index]];
        return x;
    }
}