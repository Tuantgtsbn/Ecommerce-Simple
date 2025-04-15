import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
    const date = new Date(dateString);

    // Lấy các thành phần của ngày
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Format: DD/MM/YYYY HH:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Thêm function format với nhiều kiểu khác nhau
export function formatDateCustom(dateString, format = 'default') {
    const date = new Date(dateString);

    const configs = {
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        year: date.getFullYear(),
        hours: date.getHours().toString().padStart(2, '0'),
        minutes: date.getMinutes().toString().padStart(2, '0'),
        seconds: date.getSeconds().toString().padStart(2, '0')
    };

    const formats = {
        default: `${configs.day}/${configs.month}/${configs.year} ${configs.hours}:${configs.minutes}`,
        shortDate: `${configs.day}/${configs.month}/${configs.year}`,
        longDate: `${configs.day}/${configs.month}/${configs.year} ${configs.hours}:${configs.minutes}:${configs.seconds}`,
        timeOnly: `${configs.hours}:${configs.minutes}`,
        monthYear: `${configs.month}/${configs.year}`
    };

    return formats[format] || formats.default;
}

export function createSearchParamsHelper(filterParams) {
    const queryParams = [];
    console.log(filterParams, 'filterParams');
    for (const [key, value] of Object.entries(filterParams)) {
        if (Array.isArray(value) && value.length > 0) {
            const paramValue = value.join(',');

            queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
        } else {
            queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
    }

    console.log(queryParams, 'queryParams');

    return queryParams.join('&');
}
export function mappingStatusOrder(status) {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'inProcess':
            return 'In process';
        case 'confirmed':
            return 'Confirmed';
        case 'inShipping':
            return 'In shipping';
        case 'delivered':
            return 'Delivered';
        case 'rejected':
            return 'Rejected';
        case 'cancelled':
            return 'Cancelled';
        case 'failedDelivery':
            return 'Failed delivery';
        default:
            return 'Unknown';
    }
}
