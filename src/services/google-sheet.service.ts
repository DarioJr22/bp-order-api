
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import axios from "axios";

@Injectable()
export class GoogleSheetsService {
  // Substitua com sua API key e ID da planilha
  private apiKey = 'AIzaSyBYs-LDqAQMylk106AC02bRuAzznRzP_ag';
  private spreadsheetId = '117D5fCXgejm1ijBo-xJqv5Fxts0Pxj9Dmvt1FjdoL_Q';

  /**
   * Lê os valores de um determinado range na planilha
   * Exemplo de range: 'Página1!A1:C10'
   */
  public getSheetValues(range: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
    return axios.get(url);
  }


   /**
   * Lê os valores de um determinado range na planilha
   * Para recuperar todas as linhas com dados, use 'Página1' ou 'Página1!A:Z'
   */
   public getAllSheetValues(range: string = 'BRAVAN') {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
    return axios.get(url);
  }

  /**
   * Escreve (update) valores em um determinado range na planilha
   * O parâmetro 'values' deve ser um array de arrays, por exemplo:
   * [
   *   ["Nome", "Idade", "Cidade"],
   *   ["Fulano", "30", "São Paulo"],
   *   ["Ciclano", "25", "Rio de Janeiro"]
   * ]
   */
  public updateSheetValues(range: string, values: any[][]) {
    const url = `/api/sheets/write`;
    const body = {
      "spreadsheetId": this.spreadsheetId,
      "range": range,
      "values":values
    };

    return axios.post(url, body);
  }

  /* Escrever valores */
}