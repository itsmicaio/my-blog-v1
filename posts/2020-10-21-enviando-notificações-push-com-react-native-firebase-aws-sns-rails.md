---
title: Enviando notificações push com React Native + Firebase + AWS SNS + Rails
description: Step by step
date: 2020-10-21T11:22:28.000Z
thumbnail: assets/img/banner-i18n-reactjs.png
category: react
---
1. passo criar um projeto React Native
2. passo instalar o core do firebase 

yarn add @react-native-firebase/app\
yarn add @react-native-firebase/messaging\
cd ios/ && pod install && cd ..

3. criar um projeto firebase

\-- config android

4. gerar credenciais android no firebase

* pegar o pacote do aplicativo
* rodar: cd android && ./gradlew signingReport
* vão aparecer várias informações, nós precisaremos da chave SHA1 do "Variant: androidDebugTest" 
* clicar em registrar

5. baixar o arquivo google-service.json gerado pelo firebase e adicionar em android/app
6. adicionar e executar o plugin do firebase

em /android/build.gradle
```java
buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.3.3'
    // Add me --- /\
  }
}
```

em /android/app/build.gradle
```java
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // <- Add this line
```

-- ios
7. gerar credenciais ios no firebase

* pegar o pacote do aplicativo
* pegar o id do aplicativo no Apple Developer - App Store Connect

6. baixar o arquivo GoogleService-Info.plist gerado pelo firebase e adicionar no aplicativo. Esse passo deve ser feito pelo XCode.

Para isso de clique com o botão direito no nome do projeto e cliquem em "Add files to {nome do projeto}".
Na janela que vai abrir selecione o arquivo em clique em "Add"

7. configurar firebase com as credenciais do iOS
Vá para /ios/{projectName}/AppDelegate.m
No topo do arquivo, importe o firebase:
```Swift
#import <Firebase.h>
```
Depois dentro da função didFinishLaunchingWithOptions adicione a configuração do Firebase

```Swift
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // Add me --- \/
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  // Add me --- /\
  // ...
}
```

8. Adicionar as "Capabilities"
Clique no nome do projeto, depois vá em "Signing & Capabilities", lá clique em "+ Capabilities" para adicionar uma nova Capability

Na tela que vai abrir procure por "Push Notifications" e de dois cliques para adicionar.
Repita o mesmo processo mas dessas vez, procure por "Background Modes"
Após adicionar o "Background Modes", você poderá escolher os modos que deseja habilitar.
Selecione "Background Fetch" e "Remote Notifications"

Veja abaixo o gif ilustrado que eu peguei da documentação do [RNFirebase](https://rnfirebase.io/):
![Gif mostrando o passo a passo](https://images.prismic.io/invertase/3a618574-dd9f-4478-9f39-9834d142b2e5_xcode-background-modes-check.gif?auto=compress,format)

9. Registrar uma nova chave APNs
Pra poder enviar push notifications para dispositivos temos que ter uma "Key" registrada em nosso painel de desenvolvedor.
Para isso entre no apple developer e registre uma nova chave Apple Push Notifications service (APNs)

10. Conectar Firebase com o APNs
Vá no painel do Firebase > Configurações do projeto > Cloud Messaging

Procure pelo seu projeto iOS configurado anteriormente e clique para fazer upload de uma nova chave.
Na janela que abre, selecione sua chave com extensão ".p8" que acabamos de gerar e cole o Key Id no campo abaixo.
Você também precisará colar o código da sua equipe na Apple Developer. Esse código pode ser achado em seu perfil como "Team ID".

11. Mandar uma notificação pelo console do Firebase
Para isso, primeiro nós temos que pegar o token do dispositivo. Em algum lugar no seu aplicativo, adicione o seguinte código:

```javascript
const configDeviceId = async () => {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    const token = await messaging().getToken()
    console.log(token)
  }
}
```
--- explicar código

no console aparecerá o token do dispositivo
--- vá no console do firebase e envie uma mensagem

-- aws sns
Va para o painel do sns e crie um novo aplicativo
- Coloque um nome para seu aplicativo
- Selecione a Plataforma de notificações por push - 
 Firebase Cloud Messaging (FCM)
- Chave da API - Vá em Firebase > Configurações do projeto > Cloud Messaging
- Criar um aplicativo de plataforma

Agora criado, vamos fazer o envio teste de uma mensagem via SNS.
Para isso, precisamos adicionar nossos endpoints, nesse passo, utilizaremos o token do dispositivo também. Então vamos lá, no painel do seu aplicativo SNS, clique em Criar endpoint de aplicativo e insira o token.
Feito isso, basta enviar uma mensagem


