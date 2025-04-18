import { hideSpinner, showSpinner } from "../common/spinner";
import { properties } from "../properties";
import { get } from "./restUtil";

export function getProp(object, keys, defaultVal) {
    keys = Array.isArray(keys) ? keys : keys.split('.')
    object = object[keys[0]]
    if (object && keys.length > 1) {
        return getProp(object, keys.slice(1), defaultVal)
    }
    return object ? object : defaultVal
}

export function customSort(collection = [], columnName, sortingOrder) {
    let sort1 = -1, sort2 = 1;
    const isAscendingSort = sortingOrder[columnName]
    if (isAscendingSort === false) {
        sort1 = 1;
        sort2 = -1;
    }
    return collection.sort(function (val1, val2) {
        let value1 = getProp(val1, columnName, '');
        let value2 = getProp(val2, columnName, '');
        // check for date data type
        if (typeof value1 !== "number") {
            value1 = value1 ? value1.toLowerCase() : value1
            value2 = value2 ? value2.toLowerCase() : value2
            if (value1 === value2) {
                return 0;
            }
        } else {
            if (value1 === value2) {
                return 0;
            }
        }
        return value1 < value2 ? sort1 : sort2;
    })
}

export const deepClone = (data) => {
    return JSON.parse(JSON.stringify(data))
}
export const constructSortingData = function (sortingOrder, column, defaultValue) {
    const response = deepClone(sortingOrder)
    for (const key in response) {
        if (response.hasOwnProperty(key)) {
            if (key === column) {
                if (response[column] === true || response[column] === false) {
                    response[column] = defaultValue || !response[column]
                } else {
                    response[column] = true
                }
            } else {
                response[key] = ""
            }
        }
    }
    return response
}

export const genderOptions = [
    {
        label: 'Male',
        value: 'M'
    }, {
        label: 'Female',
        value: 'M'
    }, {
        label: 'Other',
        value: 'other'
    }, {
        label: 'Unknown',
        value: 'unknown'
    },
]

export const getDisplayOptionForGender = (value) => {
    const displayOption = genderOptions.find((gender) => {
        return gender.value === value
    })
    return displayOption ? displayOption.label : ""
}

export const formFilterObject = (filters) => {
    return filters.map((filter) => {
        const { id, value } = filter;
        return {
            id,
            value: value[0],
            filter: value[1]
        }
    })
}

export const filterLookupBasedOnType = (lookup, mappingValue, mappingKey) => {
    return lookup.filter((data) => {
        let isTrue = false;
        if (data.mapping && data.mapping.hasOwnProperty(mappingKey) && data.mapping[mappingKey].includes(mappingValue)) {
            return isTrue = true;
        }
        return isTrue;
    })
}

export const getServiceCategoryMappingBasedOnProdType = (prodTypeLookupdate, serviceType) => {
    return prodTypeLookupdate.find((type) => type?.code === serviceType)?.mapping;
}

export const validateToDate = (fromDate, toDate) => {
    try {
        if (Date.parse(fromDate) < Date.parse(toDate))
            return false;
        return true
    } catch (e) {
        return false
    }
}

export const USNumberFormat = (price) => {
    if (price === null || price === "" || price === undefined) {
        return '$0.00';
    }
    let dollar = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    })
    return dollar.format(Number(price));
}

export const validateNumber = (object) => {
    const pattern = new RegExp("^[0-9]");
    let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
    let temp = pattern.test(key)
    if (temp === false) {
        object.preventDefault();
        return false;
    }
}

export const validateEmail = (object) => {
    const pattern = new RegExp("^[a-zA-Z0-9@._-]{1,100}$");
    let key = String.fromCharCode(!object.charCode ? object.which : object.charCode);
    let temp = pattern.test(key)
    if (temp === false) {
        object.preventDefault();
        return false;
    }
}

export const RegularModalCustomStyles = {
    content: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        maxHeight: '100%'
    }
}

export const handleOnDownload = (entityId, entityType, id) => {
    showSpinner()
    get(`${properties.ATTACHMENT_API}/${id}?entity-id=${entityId}&entity-type=${entityType}`)
        .then((resp) => {
            if (resp.data) {
                var a = document.createElement("a");
                a.href = resp.data.content;
                a.download = resp.data.fileName;
                a.click();
            }
        })
        .catch((error) => {
            console.error("error", error)
        })
        .finally(() => {
            hideSpinner()
        })
}

export const getReleventHelpdeskDetailedData = (source, data) => {
    if (source === 'EMAIL') {
        return data;
    }
    else if (source === 'LIVE-CHAT') {
        return { ...data, ...data?.chat[0] }
    }
    else {
        return {}
    }
}