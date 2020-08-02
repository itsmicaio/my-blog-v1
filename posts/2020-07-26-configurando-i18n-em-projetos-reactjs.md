---
title: Configurando i18n em projetos ReactJS
description: Um jeito simples e eficiente de internacionalizar as suas aplicações web
date: 2020-07-26T04:24:32.000Z
thumbnail: assets/img/banner-i18n-reactjs.png
category: react
---
Hoje em dia é comum termos que adicionar diferentes linguagens em aplicações web. Hoje vamos configurar um i18n bolado, com sistema de cache que vai facilitar muito a construção de seus produtos. Até mesmo para sistema com uma linguagem única é recomendável utilizar o i18n, pois você centraliza todas as mensagens em um único lugar, facilitando assim a manutenção do projeto.

![Banner - Configurando i18n em projetos ReactJS](/assets/img/banner-i18n-reactjs.png)

Para cuidar do cache do nosso i18n, nós vamos utilizar o [lodash.memoize](https://www.npmjs.com/package/lodash.memoize), ela vai dar uma performance a mais para nossa tradução, pois ela vai guardar o histórico de busca de traduções, facilitando o acesso das chaves já acessadas. Você pode [ler mais na documentação do lodash sobre o memoize](<>) e utilizar em outra situações.  

Então vamos começar

### Instalando as libs

Como sempre o primeiro e mais fácil passo, vamos executar o comando de instalação na raiz do projeto para iniciar os trabalhos.

`
yarn add i18n-js lodash.memoize
`

### Organizando as pastas

Após a instalação das libs, vamos separar o canto do i18n para deixar as coisas organizadas no nosso projeto

Na pasta source (src) do seu projeto, crie uma nova pasta chamada *i18n*, e em seguida crie um arquivo chamado *config.js* nessa pasta. Nós já vamos trabalhar nesse arquivo.

Ainda falta uma pasta para guardar as nossas traduções, então, dentro da pasta *i18n* crie uma pasta chamada *translations* e nela crie dois arquivos um para as traduções em português que vai se chamar *pt.json*, dentro desse arquivo cole nossa primeira tradução:

```bash
{   
  "pt": {
    "hello": "Olá, %{key}",
    "global": {
      "exit": "Sair"
    }
  }
}
```

e um para inglês chamada *en.json*, dentro cole:

```bash
{
  "en": {
    "hello": "Hello, %{key}",
    "global": {
      "exit": "Exit"
    }
  }
}
```

Em baixo eu vou mostrar na prática o uso do _%{key}_, mas ele serve para que nós possamos adicionar variáveis dentro da frase, esse é um exemplo simples, mas vocês podem adicionar quantas variáveis forem necessárias para compor sua mensagem.

### Configurando 
Agora vamos pro código!

No início do arquivo, vamos importar as libs e também criar um objeto chamado _translationGetters_ que vai armazenar os nossos arquivos de traduções.

```javascript
import i18n from 'i18n-js'
import memoize from 'lodash.memoize'

const translationGetters = {
  pt: () => require('./translations/pt.json'),
  en: () => require('./translations/en.json'),
}
```

No próximo passo nós vamos iniciar a configuração no nosso código, para guardar o idioma do usuário nós vamos utilizar o [localStorage](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/Window.localStorage). Adicione essas linhas no seu código:

```javascript
export const setI18nConfig = () => {
  const locale = getLocale()
  
  setDefaultLocale(locale)
  i18n.translations = translationGetters[locale]()
  i18n.locale = locale
  translate.cache.clear()
};

const getLocale = () => {
  const locale = getDefaultLanguage() || "pt"
  
  return locale
};

export const setDefaultLocale = (language) => {
  localStorage.setItem('language', language)
}

export const getDefaultLocale = () => localStorage.getItem('language')
```

A primeira função _setI18nConfig_ é responsável por setar as configurações necessárias, para isso, ela busca a _locale_ - que no nosso caso deve ser "pt" ou "en", e guarda utilizando a função responsável por salvar no localStorage _setDefaultLocale_

Além disso, ela também configura as _translations_ e o _locale_ do i18n. Observe que a função _getLocale_, busca o _locale_ salvo no _localStorage_, mas caso não ache nada vai utilizar português como a linguagem padrão.

### Sincronizando a linguagem do navegador do usuário
Pra facilitar o uso do sistema, é ideal que o usuário ja entre com sua linguagem de preferência setada no sistema. Para isso vamos adicionar mais duas funções no nosso código e atualizar a _getLocale_ para buscar a linguagem do browser caso ainda não tenha uma definida.

```javascript
//atualize
const getLocale = () => {
  const locale = getDefaultLocale() || getBrowserLanguage() || "pt"
  
  return locale;
};

//adicione
const getBrowserLanguage = () => {
  const {userLanguage, language} = window.navigator
  const browserLanguage = userLanguage || language;

  const locale = getAvailableLocale(browserLanguage)

  return locale
}

const getAvailableLocale = (language) => {
  const availableTranslations = Object.entries(translationGetters)

  language = language.toLowerCase()
  const availabeTranslation = 
    availableTranslations
      .filter(translation => language.includes(translation[0]))[0]
  
  const locale = availabeTranslation && availabeTranslation[0]

  return locale
}
```

Nó código acima, nós atualizamos o _getLocale_ para também pegar o _getBrowserLanguage_ caso não tenha um idioma definido no _localStorage_.

Para buscar a linguagem padrão do navegador, nos utilizamos o _window.navigator_ que fornece pra gente o _userLanguage_ e o _language_, que para um usuário que usa o idioma Português Brasileiro deve ser algo parecido como pt\_BR, por isso, nós também criamos uma função para buscar o _locale_ correspondente (se existir) ao idioma do navegador. Nesse exemplo o _locale_ correspondente seria _pt_.

### Adicionando o método translate
O método translate é o mais importante do nosso tutorial, ele que será utilizado para buscar as traduções.

```javascript
export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
)
```

Esse método é um pouco confuso pra quem nunca utilizou o _memoize_, mas vamos entender o que está acontecendo aqui.

A primeira linha (ou parâmetro da função _memoize_) é de fato o mapeamento da função do i18n que recebe uma _key_, que deve ser uma string com o caminho da tradução e o _cofig_, que deve ser um objeto com as variáveis de mensagem.
O segundo parâmetro (ou linha), é responsável pela criação de uma chave para guardar o cache da chamada.

### Chamando os métodos e traduções
Antes de chamar de fato nossa tradução no código, primeiro chame a função _setI18nConfig_ na index do seu projeto.

```javascript
import { setI18nConfig } from '~/i18n/config'

setI18nConfig()
```

Tudo pronto, agora é só chamar o _translate_ no código e teremos o i18n com o memoize em ação:

```javascript
import { translate } from '~/i18n/config'
translate('hello', {key: "Caio"})

// output PT: "Olá, Caio"
// output EN: "Hello, Caio"
```

Observe que o primeiro parâmetro da função é o caminho da tradução separados por ponto, por exemplo vamos buscar a mensagem _exit_ dos nossos arquivos de traduções

```javascript
translate('global.exit')

// output PT: "Sair"
// output EN: "Exit"
```

### Conclusão
Deixar as mensagens do sistema de forma diretamente no código nunca é uma boa opção, por isso, usar o i18n, mesmo para um sistema de idioma único pode ser uma ótima saída para centralizar as mensagens em um lugar só e facilitar a manutenção do código.

Fiquem na paz, e logo menos eu volto com outro assunto rapeize, é nois!