export type hex = string

export interface SerializedCellContent {
    iconUrl: string,
    bgColor?: string,
    link: string
}

export interface SerializedCell {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    content?: SerializedCellContent
}

export interface Grid {
    col: number,
    row: number,
    cells: SerializedCell[]
}

export interface Icon {
    title: string,
    slug: string,
    source: string,
    hex: hex
}
