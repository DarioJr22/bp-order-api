import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { Order } from 'src/modules/order/dto/order';
// Carrega as variáveis do .env
dotenv.config();

@Injectable()
export class EmailService{
    //Tudo que será manipulado via email

    private transporter: nodemailer.Transporter;

    constructor() {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Seu host SMTP
        port: 587, // Porta SMTP
        secure: false, // true para 465, false para outras portas
        auth: {
          user: process.env.GMAIL_SENDER, // Seu email
          pass: process.env.GMAIL_PASSWORD //process.env.GMAILPASSWORD, // Sua senha
        },
      });
    }
  
    async sendMail(to: string, subject: string, text: string, html?: string) {
      const mailOptions = {
        from: `${process.env.GMAIL_NAME_SENDER} <${process.env.GMAIL_SENDER}>`, // Remetente
        to, // Destinatário
        subject, // Assunto
        text, // Texto sem formatação
        html, // Opcional: versão HTML
      };
  
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('E-mail enviado: %s', info.messageId);
        return info;
      } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        throw error;
      }
    }

   async generateOrderTemplate(order: Order) {
        let productsHtml = '';
    
        order.products.forEach((product) => {
          productsHtml += `
            <tr>
              <td>${product.nome}</td>
              <td>${product.codigo}</td>
              <td>${product.quantidade}</td>
              <td>R$ ${product.preco.toFixed(2)}</td>
              <td>R$ ${(product.preco * product.quantidade).toFixed(2)}</td>
            </tr>`;
        });
    
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Detalhes do Pedido</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: auto;
                }
                h1 {
                    color: #e63946;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .order-details {
                    margin-bottom: 20px;
                }
                .order-details h2 {
                    color: #457b9d;
                    border-bottom: 2px solid #e63946;
                    padding-bottom: 5px;
                }
                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .products-table th, .products-table td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                .products-table th {
                    background-color: #457b9d;
                    color: white;
                }
                .products-table td {
                    background-color: #f1faee;
                }
                .total-price {
                    text-align: right;
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #e63946;
                }
                .footer {
                    text-align: center;
                    color: #a8a8a8;
                    margin-top: 20px;
                }
                .footer a {
                    color: #457b9d;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Resumo do Pedido</h1>
    
                <div class="order-details">
                    <h2>Detalhes da Ordem</h2>
                    <p><strong>Preço Total:</strong> R$ ${order.price.toFixed(2)}</p>
                </div>
    
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Nome do Produto</th>
                            <th>Código</th>
                            <th>Quantidade</th>
                            <th>Preço Unitário</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsHtml}
                    </tbody>
                </table>
    
                <div class="total-price">
                    <p>Total: R$ ${order.price.toFixed(2)}</p>
                </div>
    
                <div class="footer">
                    <p>Obrigado por comprar conosco!</p>
                    <p>Visite nosso site: <a href="https://seusite.com">seusite.com</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    
}