# Guia de Configuração do Portfólio Fotográfico

## Visão Geral
Este documento descreve, passo a passo e em linguagem simples, como transformar o seu arquivo **`m-arte-portfolio.html`** em um site hospedado no GitHub e automaticamente implantado em um VPS Ubuntu usando **GitHub Actions**.

## Pré‑requisitos
1. **Conta no GitHub** (já possui).
2. **GitHub Desktop** instalado no seu computador.
3. **Token de Acesso Pessoal (PAT)** com permissões `repo` e `workflow` (já possui).
4. **Chave SSH** configurada para acesso ao VPS (já possui) e usuário `ubuntu` com permissão de escrita no diretório de destino.
5. **Acesso ao VPS** (IP ou hostname) – você receberá este dado do seu provedor.

> **Importante:** Todo o processo será feito localmente no seu computador e depois enviado ao GitHub. O VPS será configurado apenas quando o site já estiver no repositório.

## 1. Criar o Repositório no GitHub (Privado)
1. Abra o **GitHub Desktop**.
2. Clique em **File → New repository**.
3. Preencha:
   - **Name:** `marte-portifolio`
   - **Description:** (opcional)
   - **Local path:** escolha uma pasta (ex.: `C:\Users\Igor\Downloads\backend\PORTIFOLIO M.ARTE`)
   - **Visibility:** **Private**
4. Marque a opção **Initialize this repository with a README** (não se preocupe, vamos substituir o README depois).
5. Clique em **Create repository**.
6. No menu **Repository → Repository settings**, copie a URL SSH do repositório (algo como `git@github.com:seu-usuario/marte-portifolio.git`).

## 2. Preparar os Arquivos do Projeto
1. Copie o seu arquivo `m-arte-portfolio.html` para a pasta do repositório criada acima.
2. Renomeie o arquivo para `index.html` (clique com o botão direito → Rename).
3. (Opcional) Crie uma pasta chamada `public` e mova `index.html` para dentro. Isso facilita a inclusão de imagens, CSS, etc.
4. Abra o **GitHub Desktop**, você verá o arquivo `index.html` listado como *Changes*.
5. Preencha a mensagem de commit: `Add initial portfolio site`.
6. Clique em **Commit to main**.
7. Clique em **Push origin** para enviar ao GitHub.

## 3. Configurar Secrets no GitHub (para o Deploy)
1. Acesse o repositório no site do GitHub (https://github.com/SEU_USUARIO/marte-portifolio).
2. Vá em **Settings → Secrets and variables → Actions → New repository secret**.
3. Crie os seguintes segredos:
   - **`SSH_KEY`** – cole o conteúdo da sua chave privada (sem senha). *Não compartilhe!*.
   - **`VPS_HOST`** – o IP ou hostname do seu VPS Ubuntu.
   - **`NEED_RELOAD`** – `true` se quiser que o Nginx seja recarregado após cada deploy, caso contrário `false`.
4. Salve cada secret.

## 4. Adicionar o Workflow de Deploy
O arquivo de workflow já foi criado em `.github/workflows/deploy.yml`. Ele será executado a cada `git push` na branch `main`.

## 5. Testar o Deploy
1. No **GitHub Desktop**, faça uma pequena alteração no `index.html` (ex.: mudar um título).
2. Commit e **Push** novamente.
3. No GitHub, abra a aba **Actions** e aguarde o job *Deploy to VPS* terminar.
4. Quando o job concluir com **Success**, conecte ao VPS:
   ```bash
   ssh ubuntu@<VPS_HOST>
   ```
5. Verifique se o arquivo está no diretório `/var/www/marte-portfolio/`:
   ```bash
   ls -l /var/www/marte-portfolio/
   ```
6. Abra o navegador e acesse `http://<VPS_HOST>` – a sua página deve aparecer.

## 6. Próximos Passos (para quando estiver pronto)
- **Configurar Domínio:** apontar o DNS do seu domínio para o IP do VPS e criar um certificado HTTPS com **Let’s Encrypt**.
- **Melhorias de Design:** mover CSS/JS para pastas próprias, otimizar imagens, etc.

---

### Dúvidas Frequentes
- **Por que usar `rsync`?** Ele copia apenas os arquivos que mudaram, preservando permissões e deletando arquivos removidos.
- **E se eu quiser usar Nginx?** O workflow opcional recarrega o Nginx após o deploy. Basta garantir que o Nginx esteja instalado e configurado para servir `/var/www/marte-portfolio`.
- **Posso usar outro usuário?** Sim, basta mudar `ubuntu@` para `seu_usuario@` no workflow e garantir que a chave SSH corresponda.

Se precisar de ajuda em algum passo, avise que explico com mais detalhes!
