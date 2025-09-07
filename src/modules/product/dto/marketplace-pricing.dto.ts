import { ProducPricing } from './product-pricing-status';

export class AddMarketplacePricingDto {
  codigo: string; // Código do produto
  pricing: ProducPricing; // Configuração de preço para adicionar
}

export class DeleteMarketplacePricingDto {
  codigo: string; // Código do produto
  marketplace: string; // Nome do marketplace a remover
}

export class MarketplacePricingResponseDto {
  success: boolean;
  message: string;
  data?: ProducPricing[];
}
