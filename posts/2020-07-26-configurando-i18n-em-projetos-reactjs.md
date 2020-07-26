---
title: Configurando i18n em projetos ReactJS
description: Um jeito simples e eficiente de internacionalizar as suas aplicações web
date: 2020-07-26T04:24:32.000Z
thumbnail: assets/img/banner2.png
category: react
---
Hoje em dia é comum termos que adicionar diferentes linguagens em aplicações web. Hoje vamos configurar um i18n bolado, com sistema de cache que vai facilitar muito a construção de seus produtos. Até mesmo para sistema com uma linguagem única é recomendável utilizar o i18n, pois você centraliza todas as mensagens em um único lugar, facilitando assim a manutenção do projeto.

- FOTO DO POST

Para cuidar do cache do nosso i18n, nós vamos utilizar o [lodash.memoize](https://www.npmjs.com/package/lodash.memoize), ela vai dar uma performance a mais para nossa tradução, pois ela vai guardar o histórico de busca de traduções, facilitando o acesso das chaves já acessadas. Você pode [ler mais na documentação do lodash sobre o memoize](<>) e utilizar em outra situações.  

Então vamos começar

### Instalando as libs

Como sempre o primeiro e mais fácil passo, vamos executar o comando de instalação na raiz do projeto para iniciar os trabalhos.

`
yarn add i18n-js lodash.memoize
`

### Organizando as pastas

Após a instalação das libs, vamos separar o canto do i18n para deixar as coisas organizadas no nosso projeto

na pasta source (src) do seu projeto, crie uma nova pasta chamada *i18n*, e em seguida crie um arquivo chamado *config.js* nessa pasta. Nós já vamos trabalhar nesse arquivo.

Ainda falta uma pasta para guardar as nossas traduções, então, dentro da pasta *i18n* crie uma pasta chamada *translations* e nela crie dois arquivos um para as traduções em português que vai se chamar *pt.json*, dentro desse arquivo cole nossa primeira tradução:

```bash
{   "pt": {
    "hello: "Olá, %{key}"
  }
}
```

e um para inglês chamada *en.json*, dentro cole:

```bash
{
  "en": {
    "hello: "Hello, %{key}"
  }
}
```

Em baixo eu vou mostrar na prática o uso do _%{key}_, mas ele serve para que nós possamos adicionar variáveis dentro da frase, esse é um exemplo simples, mas vocês podem adicionar quantas variáveis forem necessárias para compor sua mensagem.

### Configurando 
Agora vamos pro código!

No início do arquivo, vamos importar as libs e também criar um objeto chamado _translationGetters_ que vai armazenar os nossos arquivos de traduções.

```javascript
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';

const translationGetters = {
  pt: () => require('./translations/pt.json'),
  en: () => require('./translations/en.json'),
};
```

O próximo passo nós vamos iniciar a configuração no nosso codigo. 
