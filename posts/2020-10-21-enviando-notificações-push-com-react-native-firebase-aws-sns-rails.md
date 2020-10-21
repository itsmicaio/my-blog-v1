---
title: Enviando notificações push com React Native + Firebase + AWS SNS + Rails
description: Step by step
date: 2020-10-21 11:22:28
thumbnail: assets/img/banner-i18n-reactjs.png
category: react
---
1. passo criar um projeto React Native
2. passo instalar o core do firebase yarn add @react-native-firebase/app
   yarn add @react-native-firebase/messaging
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

7. Adicionar as "Capabilities"
Clique no nome do projeto, depois vá em "Signing & Capabilities", lá clique em "+ Capabilities" para adicionar uma nova Capability

Na tela que vai abrir procure por "Push Notifications" e de dois cliques para adicionar.
Repita o mesmo processo mas dessas vez, procure por "Background Modes"
Após adicionar o "Background Modes", você poderá escolher os modos que deseja habilitar.
Selecione "Background Fetch" e "Remote Notifications"

[Imagem do firebase](https://images.prismic.io/invertase/3a618574-dd9f-4478-9f39-9834d142b2e5_xcode-background-modes-check.gif?auto=compress,format)

