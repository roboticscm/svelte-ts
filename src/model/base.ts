export interface TableColumn {
    title: string;
    name: string;
}

export interface SimpleListParam {
    tableName: string;
    columns: string;
    orderBy: string;
    textSearch: string;
    page: number;
    pageSize: number;
    onlyMe: boolean;
    includeDisabled: boolean;
}

export interface PayloadRes {
    payload: any[];
    fullCount: number;
}
