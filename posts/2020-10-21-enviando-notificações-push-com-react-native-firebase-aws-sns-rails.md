---
title: Configurando recebimento de push no app React Native
description: Nesse tutorial nós vamos ver o passo a passo do recebimento de push
  em um app, enviado via console SNS e Firebase
date: 2020-10-21T11:22:28.000Z
thumbnail: assets/img/banner-recebendo-push-react-native.png
category: react
---
As push notifications ganharam o mundo com a chegada dos smarthphones, hoje em dia é impossível (ou quase) você ter um aplicativo em seu celular que não envie uma notificação ao longo do dia. Não da pra negar que pro negócio as push são essenciais para manter o engajamento dos usuários, e é por isso que hoje lhes trago o primeiro artigo de uma série de 3 artigos, na qual vou mostrar passo a passo a montar uma stack que sou muito fã e utilizou em alguns projetos na VilaApps.

Se liga que legal vai ser essa jornada rapeize:
- Parte 1: Configurando recebimento de push no app React Native
- Parte 2: Enviando push notifications a partir de um projeto Rails
- Parte 3: Configurando tópicos do SNS e filas do SQS para envio em massa de push notifications

![Imagem do post](/assets/img/banner-recebendo-push-react-native.png)

Galera, pra esse passo a passo eu vou considerar que vocês já tenham um **projeto React Native configurado com as credenciais**. Isso é importante para fazer funcionar no iOS. Para Android não temos muitas limitações. Também é necessário ter uma **conta na AWS**.

então vamos lá, sem mais delongas, let's code it!

### Instalando as libs
O primeiro passo - como sempre - é instalar as libs. Então, no seu terminal, rode os comandos a baixo:
```bash
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging
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
Então vamos la, o Firebase vai te liberar o download do arquivo _GoogleService-Info.plist_, com ele em mãos, vamos para o XCode.\
Abra seu projeto no XCode e clique com o botão direito no nome do projeto (localizado no canto esquerdo da IDE), nas opções que vão se abrir, clique em "Add files to {nome do projeto}". Abrirá uma janela para você escolher o arquivo, selecione-o e clique em "Add"

Para finalizar temos que configurar o Firebase com as credenciais que acabamos de adicionar no nosso código. 
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

### Habilitando push notifications e background mode no iOS
Diferente do Android, para receber notificações no iOS precisamos adicionar ~~super poderes~~ ao app, adicionando capacidade dele receber Push Notifications e também de trabalhar em segundo plano (Background Mode).

Primeiro vamos adicionar as capacidades, ou Capabilities, para isso clique no nome do projeto para abrir as configurações, lá procure "Signing & Capabilities" no menu horizontal. Você verá um botão com o texto "+ Capability", clique nele para poder adicionar uma nova capacidade.

Na tela que vai abrir procure por "Push Notifications" e de dois cliques para adicionar. Repita o mesmo processo mas dessas vez, procure por "Background Modes".\
Após adicionar o "Background Modes", você poderá escolher os modos que deseja habilitar. Para nosso objetivo devemos selecionar "Background Fetch" e "Remote Notifications"

Veja abaixo o gif ilustrado que eu peguei da documentação do [RNFirebase](https://rnfirebase.io/): ![Gif mostrando o passo a passo](https://images.prismic.io/invertase/3a618574-dd9f-4478-9f39-9834d142b2e5_xcode-background-modes-check.gif?auto=compress,format)

### Registrando chave APNs na App Store Connect
Para que tudo funcione como esperado, nós precisamos ainda gerar uma chave do Apple Push Notification Service - APNs.

Esse passo é bem simples, no seu painel [Apple Developer](https://developer.apple.com/account/resources/authkeys/list), e clique para adicionar uma nova "Key". Digite o nome da sua chave e selecione Apple Push Notifications service (APNs) e prossiga para o registro. No final do processo será liberado o download da sua chave com extensão _.p8_. Guarde essa chave com muito cuidado, nós ja vamos precisar dela.

### Conectar o Firebase com seu APNs
O Firebase só consegue te enviar mensagens se ele tiver acesso a sua chave do APNs. 

Por isso agora vamos fornecer ele os dados necessários para fazer isso.
Em seu painel do Firebase vá para Configurações do projeto (na engrenagem da barra lateral), e depois entre na aba Cloud Messaging

Dentro das configurações do Cloud Messaging, procure pelo seu projeto iOS configurado anteriormente e clique para fazer upload de uma nova chave.\
Na janela que abre, selecione sua chave com extensão ".p8" que acabamos de gerar e cole o Key ID no campo abaixo - encontre o Key ID no mesmo lugar que configuramos nossa chave APNs.\
Você também precisará colar o código da sua equipe na Apple Developer. Esse código pode ser achado em seu perfil como "Team ID".

### Solicitando permissão e encontrando o Device ID
O envio de notificação é feito com base no token do dispositivo, que é gerado automaticamente pelo Firebase. Então, antes de enviarmos uma mensagem precisamos pegar o device id do nosso dispositivo de teste.
Para celulares iOS, também é necessário pedir permissão pro usuário para utilizar funções de push, como resgatar o token e receber notificações.

Primeiro nós temos que pegar o token do dispositivo nosso dispositivo de testes **(O simulador do iOS não suporta Push Notifications, para testar você terá que usar um dispositivo real)**.

Em algum lugar no seu aplicativo, adicione a seguinte função:
```javascript
const printDeviceID = async () => {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    const token = await messaging().getToken()
    console.log('token****', token)
  }
}
```
Essa função da um console.log no token do nosso dispositivo, mas antes disso nós solicitamos permissão para enviar push notifications com o método `await messaging().requestPermission()` que retorna um booleano.\
Para dispositivos Android não é necessário conceder permissão para recebimento de push, então a resposta sempre será true, já para iOS o comando pergunta se o usuário deseja conceder a permissão e retorna a resposta.

**Lembrando que você precisar de executar a função para que a ação ocorra, então chame `printDeviceID()` em algum lugar propício do seu código;**

Tudo pronto, agora só precisamos rodar a aplicação e copiar o código que aparecerá no console antes de partir pro próximo passo.

### Enviando notificação pelo console Firebase
Para enviar uma notificação via console é muito simples, basta você entrar no seu painel, navegar para o serviço Cloud Messaging. Lá clique em "Send your first message".
Você poderá escrever o título e o corpo da mensagem. Ao final, clique em enviar mensagem de teste e adicione seu dispositivo de teste utilizando o token resgatado no ultimo tópico.

### Criando um aplicativo AWS SNS
O AWS Simple Notification Service, é uma alternativa excelente para envio de notificações para usuário, dentre algumas opções de notificações que ele suporta, estão email e sms, além da Push Notification que estamos utilizando nessa aula.

Eu escolhi o SNS para fazer a orquestração das nossas push pois ele é um serviço mais completo com as outras formas de notificações, além do preço que 
e bem pequeno. Se você não tem interesse de enviar notificações de outras naturezas, como sms e email, talvez o Firebase já consiga fazer o papel pra você, é sempre bom fazer uma análise mais profunda para escolher qual tecnologia usar.

Mas vamos lá, hora de criar nosso aplicativo SNS.\
No seu console AWS entre no serviço Simple Notification Service e vá para Mobile > Notificações por push.\
Lá nós vamos clicar em "Criar um aplicativo de plataforma" e preencher o formulário de criação.
No formulário, coloque um nome para seu aplicativo, selecione a Plataforma de notificações por push - Firebase Cloud Messaging (FCM).\
No campo Chave da API, você vai precisar voltar em seu console Firebase e ir para Configurações do projeto > Cloud Messaging. Lá copie a Chave do servidor e cole no formulário. Para finalizar clique em "Criar um aplicativo de plataforma".

### Criando um endpoint no nosso aplicativo SNS
Um endpoint é como se fosse uma referência ao seu dispositivo. Ele é criado utilizando o token do dispositivo, e utiliza o mesmo para fazer o envio de notificação.

Agora na página do aplicativo que acabamos de criar, clique em "Criar endpoint de aplicativo", insira o token e no campo de dados arbitrários não coloque nada. Prossiga para criar o endpoint.

### Enviando notificação pelo console do SNS
Também para validar nossa implementação vamos enviar uma notificação para nosso endpoint que acabamos de criar. Selecione seu endpoint de aplicativo, e clique em publicar mensagem.

Em estrutura da mensagem, selecione "Carga personalizada" e cole na caixa de texto o json abaixo:
```json
{
     "GCM": "{ \"notification\": { \"body\": \"{Corpo da sua mensagem aqui}", \"title\": \"{Título da sua mensagem aqui}\", \"sound\":\"default\" } , \"data\" : {\"key\" : \"value\", \"key2\" : \"value\" } }"
}
```
Observe que no objeto "notification", nós temos os atributos body e title, que servem para o corpo da mensagem e o título respectivamente. Também tem o objeto data, que é utilizado caso você queira enviar dados para o dispositivo, isso é muito utilizado para fazer navegações no app via push, ou até dar bonificações ao usuário.

### Conclusão
Nessa primeira parte da nossa série das push, nós entendendo um pouco de como funciona o envio de push e configuramos nosso aplicativo em React Native para receber notificações enviada via console.\
No proximo capítulo nós vamos fazer o envio de push através da nossa aplicação Ruby On Rails, configurando todo o fluxo de push notification e utilizando o aws-sdk para comunicação com o AWS SNS.

Obrigado por lerem até aqui! Um abraço a todos e fiquem na paz :)