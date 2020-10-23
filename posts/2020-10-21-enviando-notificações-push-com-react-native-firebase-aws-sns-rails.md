---
title: Enviando notificações push com React Native + Firebase + AWS SNS + Rails
description: Step by step
date: 2020-10-21T11:22:28.000Z
thumbnail: assets/img/banner-i18n-reactjs.png
category: react
---
As push notifications ganharam o mundo com a chegada dos smarthphones, hoje em dia é impossível (ou quase) você ter um aplicativo em seu celular que não envie uma notificação ao longo do dia. Não da pra negar que pro negócio as push são essenciais para manter o engajamento dos usuários, e é por isso que hoje lhes trago o primeiro artigo de uma série de 3 artigos, na qual vou mostrar passo a passo a montar uma stack que sou muito fã e utilizou em alguns projetos na VilaApps.

Se liga que legal vai ser essa jornada rapeize:
- Parte 1: Configurando push notifications no React Native via console do SNS
- Parte 2: Enviando push notifications a partir de um projeto Rails
- Parte 3: Configurando tópicos do SNS e filas do SQS para envio em massa de push notifications

![Imagem do post](/assets/img/banner2.png)

Galera, pra esse passo a passo eu vou considerar que vocês já tenham um **projeto React Native configurado com as credenciais**. Isso é importante para fazer funcionar no iOS. Para Android não temos muitas limitações. Também é necessário ter uma **conta na AWS**.

então vamos lá, sem mais delongas, let's code it!

### Instalando as libs
O primeiro passo - como sempre - é instalar as libs. Então, no seu terminal, rode os comandos a baixo:
```bash
yarn add @react-native-firebase/app\
yarn add @react-native-firebase/messaging\
cd ios/ && pod install && cd ..
```

### Criando projeto Firebase
O Firebase vai ser o coração das nossas notificações. É ele que vai "bombear" as push notifications pros dispositivos cadastrados.\
Para criar um projeto é bem simples, acesse o [console do Firebase](https://console.firebase.google.com/) e clique em "+ Adicionar projeto"

### Configurando app Android no Firebase
Para conectar seu aplicativo com o Firebase, nós teremos que configura-lo no console do seu projeto recém criado. Logo após criar o projeto, a página inicial terá um banner te convidando a adicionar seu primeiro app, é lá mesmo que temos que ir, clique para adicionar um aplicativo Android.

Preencha as informações solicitadas e clique em registrar.

_**Obs:** O Certificado de assinatura de depuração SHA-1 é opcional, mas você pode consegui-lo rodando `cd android && ./gradlew signingReport`. Ira aparecer uma série de chaves, você deve pegar o SHA-1 do Variant: androidDebugTest_

Agora vem um passo muito importante, porém, muito simples. O Firebase vai liberar a você o download do arquivo de credencias do seu app, denominado de _google-service.json_. Faça o download e leve-o direto pra pasta _/android/app_ do seu projeto React Native 

6. adicionar e executar o plugin do firebase

Vamos agora adicionar o plugin do Firebase em _/android/build.gradle_

```java
buildscript {
  dependencies {
    // ... outras dependencias
    classpath 'com.google.gms:google-services:4.3.3'
    // Adicione essa linha acima --- /\
  }
}
```

Após adicionar o plugin, temos que executa-lo no final do arquivo _/android/app/build.gradle_

```java
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // <- Adicione essa linha
```

### Configurando app iOS no Firebase
Como fizemos no Android, agora é hora de adicionar o aplicativo iOS em seu projeto Firebase.
Na página inicial do console Firebase, novamente clique em adicionar um app, mas dessa vez escolha o iOS.

Preencha as informações solicitadas e clique em registrar.

_**Obs:** você encontra o id do aplicativo em seu painel de desenvolvedor da App Store Connect_

Novamente vamos o passo importante, porém, dessa vez será um pouco mais complicado. Isso por que, para adicionar um arquivo ao projeto iOS não basta arrasta-lo, o processo deve ser feito dentro do seu XCode.\
Então vamos la, o Firebase vai te liberar o download do arquivo _GoogleService-Info.plist_, com ele em mãos, vamos para o XCode.

Com seu projeto aberto, clique com o botão direito no nome do projeto (localizado no canto esquerdo da IDE), nas opções que vão se abrir, clique em "Add files to {nome do projeto}". Abrirá uma janela para você escolher o arquivo, selecione-o e clique em "Add"

Para finalizar temos que configurar o Firebase as credenciais que acabamos de adicionar no nosso código. 
Abra o arquivo _/ios/{projectName}/AppDelegate.m_ e no topo do arquivo importe o firebase

```Swift
#import <Firebase.h>
```

Depois dentro desça um pouco o arquivo e ache a função `didFinishLaunchingWithOptions`, e adicione a configuração do Firebase dentro dela

```Swift
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // \/ --- Adicione esse bloco de código --- \/
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  // /\ --- Adicione esse bloco de código --- /\
  // ...
}
```

### Configurar Apple Push Notifications service (APNs)
Diferente do Android, para receber notificações no iOS precisamos adicionar ~~super poderes~~ ao app, adicionando capacidade dele receber Push Notification e também de de trabalhar em segundo plano. Além de termos que adicionar uma key de APNs pra ele.

Primeiro vamos adicionar as capacidades, ou Capabilities, para isso clique no nome do projeto, você ira ver a tela de configurações do app, lá procure "Signing & Capabilities" no menu horizontal logo acima das informações. Você verá um botão com o texto "+ Capability", clique nele para poder adicionar uma nova capacidade.

Na tela que vai abrir procure por "Push Notifications" e de dois cliques para adicionar. Repita o mesmo processo mas dessas vez, procure por "Background Modes"
Após adicionar o "Background Modes", você poderá escolher os modos que deseja habilitar.
Para nosso objetivo devemos selecionar "Background Fetch" e "Remote Notifications"

Veja abaixo o gif ilustrado que eu peguei da documentação do [RNFirebase](https://rnfirebase.io/): ![Gif mostrando o passo a passo](https://images.prismic.io/invertase/3a618574-dd9f-4478-9f39-9834d142b2e5_xcode-background-modes-check.gif?auto=compress,format)


9. Registrar uma nova chave APNs Pra poder enviar push notifications para dispositivos temos que ter uma "Key" registrada em nosso painel de desenvolvedor.
   Para isso entre no apple developer e registre uma nova chave Apple Push Notifications service (APNs)
10. Conectar Firebase com o APNs Vá no painel do Firebase > Configurações do projeto > Cloud Messaging

Procure pelo seu projeto iOS configurado anteriormente e clique para fazer upload de uma nova chave. Na janela que abre, selecione sua chave com extensão ".p8" que acabamos de gerar e cole o Key Id no campo abaixo.
Você também precisará colar o código da sua equipe na Apple Developer. Esse código pode ser achado em seu perfil como "Team ID".

11. Mandar uma notificação pelo console do Firebase Para isso, primeiro nós temos que pegar o token do dispositivo. Em algum lugar no seu aplicativo, adicione o seguinte código:

```javascript
const configDeviceId = async () => {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    const token = await messaging().getToken()
    console.log(token)
  }
}
```

\--- explicar código

no console aparecerá o token do dispositivo --- vá no console do firebase e envie uma mensagem

\-- aws sns Va para o painel do sns e crie um novo aplicativo

* Coloque um nome para seu aplicativo
* Selecione a Plataforma de notificações por push -  Firebase Cloud Messaging (FCM)
* Chave da API - Vá em Firebase > Configurações do projeto > Cloud Messaging
* Criar um aplicativo de plataforma

Agora criado, vamos fazer o envio teste de uma mensagem via SNS. Para isso, precisamos adicionar nossos endpoints, nesse passo, utilizaremos o token do dispositivo também. Então vamos lá, no painel do seu aplicativo SNS, clique em Criar endpoint de aplicativo e insira o token.
Feito isso, basta enviar uma mensagem