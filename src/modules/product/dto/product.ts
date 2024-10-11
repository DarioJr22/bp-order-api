export class ProductDto {
    id?: string;
    nome?: string;
    codigo?: string;
    unidade?: string;
    preco?: number;
    preco_promocional?: number;
    ncm?: string;
    origem?: string;
    gtin?: string;
    gtin_embalagem?: string;
    localizacao?: string;
    peso_liquido?: number;
    peso_bruto?: number;
    estoque_minimo?: number;
    estoque_maximo?: number;
    id_fornecedor?: string;
    nome_fornecedor?: string;
    codigo_fornecedor?: string;
    codigo_pelo_fornecedor?: string;
    unidade_por_caixa?: string;
    preco_custo?: number;
    preco_custo_medio?: number;
    situacao?: string;
    tipo?: string;
    classe_ipi?: string;
    valor_ipi_fixo?: string;
    cod_lista_servicos?: string;
    descricao_complementar?: string;
    garantia?: string;
    cest?: string;
    obs?: string;
    tipoVariacao?: string;
    variacoes?: string;
    idProdutoPai?: string;
    sob_encomenda?: string;
    dias_preparacao?: string;
    grade?: ProdutoGrade;
    marca?: string;
    tipoEmbalagem?: string;
    alturaEmbalagem?: string;
    comprimentoEmbalagem?: string;
    larguraEmbalagem?: string;
    diametroEmbalagem?: string;
    qtd_volumes?: string;
    categoria?: string;
    anexos?: any[];
    imagens_externas?: any[];
    classe_produto?: string;
    kit?: ProdutoKit[];
    seo_title?: string;
    seo_keywords?: string;
    link_video?: string;
    seo_description?: string;
    slug?: string;
    //Propridades adicionadas
    quantidade:number
    desconto:number
    saldo_estoque:any

  }
  

interface ProdutoGrade {
    Cor?: string;
}


interface ProdutoKitItem {
    id_produto?: string;
    quantidade?: number;
}


interface ProdutoKit {
    item?: ProdutoKitItem;
}
  