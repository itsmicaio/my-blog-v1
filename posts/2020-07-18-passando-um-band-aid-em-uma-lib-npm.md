---
title: Passando um band-aid em uma lib npm
description: Utilizando patch-package você pode corrigir aquele bug chato na lib
  de forma fácil e rápida.
date: 2020-07-18 11:10:27
thumbnail: assets/img/banner2.png
category: js
---
Você já se deparou com um bug chato na lib que você instalou para resolver os seus problemas? Aquele bug que depois de procurar bastante você caiu numa issue do github onde descobriu que era um defeito na lib?

Bom, trago aqui a solução dos seus problemas. Com o [patch-package](https://github.com/ds300/patch-package) você consegue alterar um trecho de código da lib e salvar a alteração, sem que sua solução se perca em instalações futuras.

Sem mais delongas, let's code it

### Instalando as libs

Bom, é claro que o primeiro passo é a gente instalar as dependências, então vamos lá, nesse caso eu vou utilizar como um exemplo um projeto em ReactNative, onde estou utilizando uma lib chamada react-native-video, o problema dela é que para stream no iOS, não tem buffer configurado, e eu preciso disso pro aplicativo de stream que estou trabalhando.

Pesquisando encontrei um [pull request aberto](https://github.com/react-native-community/react-native-video/pull/1353) que implementava exatamente o que eu precisava, a implementação do bufferConfig pro iOS.

Ok, agora sim, let's code it. Na pasta do projeto, vamos instalar a lib patch-package e sua dependência o postinstall-postinstall

```bash
yarn add patch-package postinstall-postinstall
```

### Fazendo as alterações dentro da lib

Com o patch-package instalado, vamos de fato alterar o código da lib. Vou mostrar apenas um exemplo de alteração de arquivo, mas se você quiser ver todas as alterações necessárias você pode ver no [próprio pull request](https://github.com/react-native-community/react-native-video/pull/1353)

Esse aqui é um dos arquivos que eu terei que alterar na lib para adicionar o bufferConfig:

![Alterações no de um arquivo](assets/img/captura-de-tela-2020-07-18-às-12.00.45.png "Pull request - Implement ios bufferConfig")

Para adicionar essa linha de código primeiro temos que entrar na pasta da lib, que fica localizada dentro das node_modules. Então caminhe até `node_modules/react-native/ios/Video/RCTVideoManager.m`, observe que o caminho será sempre semelhante a esse: `node_modules/<nome da lib>/...<arquivo da lib>`

Encontrado o arquivo basta eu adicionar as alterações exatamente na mesma linha que foi alterada no pull request:Alteração no meu codigo baseado na o 

![Teste](assets/img/captura-de-tela-2020-07-18-às-12.09.38.png "teste")