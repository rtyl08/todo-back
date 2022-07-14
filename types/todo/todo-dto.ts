
export interface TodoEntityDto {
    id: string,
    title: string,
    description: string,
    isClosed: boolean,
}

export interface TodoResultsDto {
    pagesCount: number,
    pageNumber: number,
    pageSize: number,
    tasks: TodoEntityDto[],
}

export interface TodoDtoMessage{
    message: string;
}