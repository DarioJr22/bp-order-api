import { Injectable } from '@nestjs/common';
import { Order } from '../order/dto/order';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Product } from '../product/dto/product';
import { Response } from 'express';
import { base64Image, base64ImageConcluido, base64ImagePdf } from 'src/shared/constants/imgs';


@Injectable()
export class ReportService {
//1 - Fazer o export do PDF 
//2 - Fazer o export do excel
async exportToExcel(res: Response, order: Order) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Produtos');

    // Definir as colunas do Excel
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'Código', key: 'codigo', width: 25 },
      { header: 'Unidade', key: 'unidade', width: 10 },
      { header: 'Preço', key: 'preco', width: 10 },
      { header: 'Quantidade', key: 'quantidade', width: 10 },
      { header: 'Preço Promocional', key: 'preco_promocional', width: 15 },
      { header: 'NCM', key: 'ncm', width: 15 },
      { header: 'Peso Líquido', key: 'peso_liquido', width: 15 },
      { header: 'Nome Fornecedor', key: 'nome_fornecedor', width: 25 },
    ];

    // Adicionar os dados dos produtos à planilha
    order.products.forEach((product) => {
      worksheet.addRow({
        id: product.id,
        nome: product.nome,
        codigo: product.codigo,
        unidade: product.unidade,
        preco: product.preco,
        quantidade: product.quantidade,
        preco_promocional: product.preco_promocional,
        ncm: product.ncm,
        peso_liquido: product.peso_liquido,
        nome_fornecedor: product.nome_fornecedor,
      });
    });

    // Adicionar uma linha vazia para separar o conteúdo dos produtos e o total
    worksheet.addRow([]);

    // Adicionar uma linha com o valor total da ordem
    worksheet.addRow({
      nome: 'Valor Total',
      preco: order.price.toFixed(2), // Formatar para 2 casas decimais
    });

    // Definir o cabeçalho da resposta e o nome do arquivo
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=produtos.xlsx',
    );

    // Gravar o arquivo Excel na resposta
    await workbook.xlsx.write(res);
    res.end();
  }

    async exportOrderToPdf(res: Response, order: Order) {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            // Definir o cabeçalho da resposta como PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

            // Iniciar a criação do PDF
            doc.pipe(res);

            // Converter as imagens base64 para buffers
            const imageBuffer = Buffer.from(base64Image, 'base64');
            const imageBufferConcluido = Buffer.from(base64ImageConcluido, 'base64');
            const imageBufferPdf = Buffer.from(base64ImagePdf, 'base64');

            // Adicionar a imagem no canto superior esquerdo (logo)
            doc.image(imageBuffer, 10, 10, {
            fit: [125, 50], // Ajusta o tamanho da imagem
            align: 'left',
            });

            // Adicionar a imagem de concluído no centro
            doc.image(imageBufferConcluido, 260, 30, {
            fit: [50, 50], // Ajusta o tamanho da imagem
            align: 'center',
            });

            doc.moveDown(3);

            // Adicionar o texto "Pedido concluído com sucesso" no centro
            doc.fontSize(24).font('Helvetica-Bold').text('Pedido concluído com sucesso', {
            align: 'center',
            });

            doc.moveDown(2);

            // Adicionar o card para valor total do pedido à esquerda com altura de 65px
            doc.roundedRect(50, 150, 230, 65, 10).fill('#F4F2F2').stroke(); // Diminuir levemente a largura do card
            doc.fillColor('#000').fontSize(16).font('Helvetica').text('Valor total do pedido:', 60, 160);
            doc.fontSize(24).font('Helvetica-Bold').fillColor('#000').text(`R$ ${order.price.toFixed(2)}`, 60, 180);
            //TODO - Definir como vai funcionar essa regra de desconto
            doc.fontSize(12).fillColor('#2B7418').text(`20% Off`, 174, 188); // Mantendo o preço e desconto separados
            doc.strokeColor('#D3D3D3'); // Define a cor da linha
            doc.moveTo(60, 210).lineTo(260, 210).stroke(); // Linha abaixo do card

            // Adicionar o card de PDF à direita com altura de 65px
            doc.roundedRect(300, 150, 230, 65, 10).fill('#F4F2F2').stroke(); // Diminuir levemente a largura do card
            doc.image(imageBufferPdf, 310, 160, {
            fit: [50, 50], // Ajusta o tamanho da imagem
            align: 'right',
            });
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Disponível via PDF', 380, 170);
            doc.strokeColor('#D3D3D3'); // Define a cor da linha
            doc.moveTo(310, 210).lineTo(510, 210).stroke(); // Linha abaixo do card
            doc.fontSize(10).fillColor('#000').text(`Data: ${new Date().toLocaleDateString()}`, 402, 188);

            doc.moveDown(3);

            // Ajuste o valor de tableTop para mover a tabela para cima
            const tableTop = 250; // Diminuído de 300 para 250 para aproximar a tabela dos cards
            const itemTopPosition = (i: number) => tableTop + (i + 1) * 30;

            // Primeiro, desenha o fundo e bordas do cabeçalho
            doc.roundedRect(50, tableTop, 500, 25, 10).fill('#EDEDED').stroke(); // Cabeçalho com background arredondado e cinza claro

            // Agora, aplica a cor e fonte do texto para que apareça sobre o fundo
            doc.fontSize(12).fillColor('#363636').font('Helvetica-Bold'); // Ajuste a cor do texto para cinza escuro
            doc.text('Código', 60, tableTop + 8); // Código
            doc.text('Nome', 125, tableTop + 8); // Nome
            doc.text('Preço', 230, tableTop + 8); // Preço
            doc.text('Quantidade', 320, tableTop + 8); // Quantidade
            doc.text('Valor Total', 420, tableTop + 8); // Valor Total

            // Linhas da tabela com os produtos
            order.products.forEach((product: Product, i: number) => {
            let y = itemTopPosition(i);
            if (y > 750) { // Limite de uma página A4
                doc.addPage();

                // Desenha o fundo e bordas do cabeçalho na nova página
                doc.roundedRect(50, 50, 500, 25, 10).fill('#EDEDED').stroke(); // Cabeçalho com background na nova página

                // Aplica a cor e fonte do texto na nova página
                doc.fontSize(12).fillColor('#363636').font('Helvetica-Bold');
                doc.text('Código', 60, 55); 
                doc.text('Nome', 125, 55);
                doc.text('Preço', 230, 55);
                doc.text('Quantidade', 320, 55);
                doc.text('Valor Total', 420, 55);
                y = 80; // Resetar a posição de Y na nova página
            }

            // Linhas coloridas alternadas com bordas arredondadas
            if (i % 2 === 0) {
                doc.roundedRect(50, y, 500, 25, 10).fill('#F9F9F9').stroke(); // Linha clara com bordas arredondadas
            } else {
                doc.roundedRect(50, y, 500, 25, 10).fill('#FFFFFF').stroke(); // Linha branca com bordas arredondadas
            }

            // Adicionar conteúdo das colunas com cor apropriada
            doc.fillColor('#363636').font('Helvetica').fontSize(12); // Cor do texto normal
            doc.text(product.id, 60, y + 8); // Código
            doc.text(product.nome.substring(0, 15), 125, y + 8); // Nome
            doc.text(`R$ ${product.preco.toFixed(2)}`, 230, y + 8); // Preço
            doc.text(product.quantidade.toString(), 320, y + 8); // Quantidade
            doc.text(`R$ ${(product.preco * product.quantidade).toFixed(2)}`, 420, y + 8); // Valor Total
            });

            // Finalizar o PDF
            doc.end();

      }


}
