export interface Items {
    art: string
    stock: string
}

export interface Size {
    name: string
    origName: string
    rank?: number
    optionId?: number
    returnCost?: number
    stocks?: object[]
    time1?: number
    time2?: number
    wh?: number
    sign?: string
    payload?: string
}