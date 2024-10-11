
export class SearchProductDto { 
 formato: string;
 pesquisa: string;
 idTag?: number;
 idListaPreco?: number;
 pagina?: number;
 gtin?: string;
 situacao?: string;
 dataCriacao?: string;
    constructor(private newSearch:Partial<SearchProductDto>){
        Object.assign(this,newSearch)
    }
}
