---
title: Enviando notificações push via app Ruby On Rails
description: Segundo capítulo da série de 3 parte que ensina como...
date: 2020-10-25T06:46:40.000Z
thumbnail: assets/img/banner-i18n-reactjs.png
category: ruby
---
As push notifications ganharam o mundo com a chegada dos smarthphones, hoje em dia é impossível (ou quase) você ter um aplicativo em seu celular que não envie uma notificação ao longo do dia. Não da pra negar que pro negócio as push são essenciais para manter o engajamento dos usuários, por isso, hoje eu lhes trago o segundo capítulo da nossa série de 3 que vai abordar o envio de notificações através de uma aplicação Rails;

Pra quem não sabe da série se liga os assuntos abordados nessa jornada rapeize:
- Parte 1: Configurando recebimento de push no app React Native
- Parte 2: Enviando push notifications a partir de um projeto Rails
- Parte 3: Configurando tópicos SNS e filas SQS para envio em massa de push notifications

![Imagem do post](/assets/img/banner2.png)

Galera para esse tutorial eu vou considerar que você já tem uma aplicação Rails funcionando e vou partir direto das instalação da gem.

Bora codar!

### Instalando a gem aws-sdk-sns
A AWS fornece um sdk muito completo para Ruby chamada [aws-sdk](https://docs.aws.amazon.com/sdk-for-ruby/). Essa gem é completamente modularizada, por isso nós vamos apenas instalar a aws-sdk-sns, que traz só a parte que nós interessa o Simple Notification Service.\

Em sua Gemfile adicione `gem 'aws-sdk-sns', '~> 1.2'` e rode `bundle` no seu terminal.

### Criando as AWS secrets
Para conectar sua aplicação com sua conta na AWS, vamos utilizar o método das AWS Secrets.\
Apesar da gente estar utilizando esse método, essa não é a melhor maneira de liberar acesso a AWS, a prática mais recomendada é utilizando as roles de acesso, mas isso é assunto para outro dia, sinta-se a vontade para pesquisar e implementar as roles na sua conta AWS.

Vamos lá, para conseguir uma credencial da AWS nós temos que usar o serviço IAM, entre na página do IAM e crie um novo usuário.
Entre no usuário e vá para "Credenciais de segurança" e Crie uma chave de acesso.

### Configurando as chaves secretas
Como as AWS secrets são dois dados sensíveis e que seu vazamento pode prejudicar muito você ou sua empresa, nós não podemos subir isso para o nosso repositório.
Por isso, a melhor maneira é colocar esse dado como ENV.
Então em um arquivo _.env_ adicione as chaves `AWS_ACCESS_KEY_ID` e a `AWS_SECRET_ACCESS_KEY`.

Dessa forma, o sdk da aws já vai entender que essas envs correspondem a seu acesso na AWS e vai utiliza-lo para se comunicar com sua conta AWS.


### Criando o primeiro serviço: o disparador de push
Nosso primeiro passo vai ser criar um serviço para disparar as push notifications, ele será responsável pela montagem do "json" e envio do comando para AWS.

Em sua pasta services (se não tem uma pasta services em seu projeto, adicione em _/app_) crie uma nova pasta chamada _sns_ e logo em seguida crie dentro de _/sns_ um arquivo chamado "push_notification.rb". No final, o caminho para seu arquivo será "app/services/sns/push_notification.rb"

Dentro dele, cole o código abaixo:
```ruby
module Sns
  class PushNotification
    def initialize(sns_endpoint, title, body)
      @sns_endpoint = sns_endpoint
      @title = title
      @body = body
      @sns = Aws::SNS::Client.new
    end

    def call
      send_push_notification
    end

    private
    def send_push_notification
      begin
        publish
      rescue Aws::SNS::Errors::EndpointDisabled => e
        @sns_endpoint.destroy
      rescue
        false
      end
    end

    def publish
      @sns.publish(
        target_arn: @sns_endpoint.arn,
        message: build_message,
        message_structure: "json"
      )
    end

    def build_message
      {
        GCM: { 
          notification: { 
            title: @title, 
            body: @body, 
            sound: "default" 
          }
        }.to_json
      }.to_json
    end
  end
end
```
Note que estamos inicializando o serviço recebendo `sns_endpoint, title, body`. O `sns_endpoint` deve ser uma instância do model SnsEndpoint que nós falaremos logo abaixo. Já o `title, body` se referem ao título e ao corpo da mensagem da notificação.

Logo em seguida temos o método `send_push_notification`, que chama o `publish` dentro de um bloco _begin-end_ para impedir que falhas acabem dando erro na nossa aplicação.\
Nós tambéms estamos fazendo um tratamento especifico pro erro _Aws::SNS::Errors::EndpointDisabled_ logo no primeiro _rescue_, esse erro ocorre quando a AWS tenta enviar uma notificação pro endpoint e ele não recebe, o que significa que o usuário não tem mais o aplicativo instalado naquele celular, por isso a gente já deleta o objeto @sns_endpoint pra que não seja mais enviado nenhuma push para ele.

Você pode ver outros [erros devolvidos pela AWS SNS nesse link](https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/SNS/Errors.html)

### Segundo serviço: criador de endpoint
Nesse momento nós vamos codar um serviço que vai ficar responsável por criar nossos endpoints na AWS.

Dentro da nossa pasta _sns_ nós vamos criar um novo arquivo chamado _create_endpoint.rb_. O caminho final será _"app/services/sns/create_endpoint.rb"_. Com o arquivo criado, cole o código abaixo dentro dele:
```ruby
module Sns
  class CreateEndpoint 
    def initialize(sns_endpoint)
      @arn = ENV["AWS_SNS_ARN"]

      @sns_endpoint = sns_endpoint
      @sns = Aws::SNS::Client.new
    end

    def call
      create_platform_endpoint
    end

    private
    def create_platform_endpoint
      @sns.create_platform_endpoint(
        platform_application_arn: @arn,
        token: @sns_endpoint.device_id
      )
    end
  end
end
```

Vamos entender o código, primeiro nós inicializamos a classe recebendo o nosso model (que será logo abaixo) e também inicializamos a classe do SNS. Para criar o endpoint a gente vai precisar do arn do nosso aplicativo SNS, por isso eu também estou setando a variável _@arn_.\
No meu caso coloquei o ARN dentro das ENVs, pois minha roda em vários ambientes diferentes, você pode escolher qual será a melhor opção para você. Você pode achar o seu ARN no seu painel AWS.

Em seguida nós chamamos a função create_platform_endpoint, que é a responsável por criar de fato o endpoint. Esse função apenas chama a funçao do _aws-sdk-sns_, passando o ARN e o device id.

### Terceiro serviço: destruidor de endpoint
Agora chegamos no nosso terceiro e ultimo serviço.
- Nossa mas pra que tanto serviço assim?\
Eu gosto de sempre separar bem as funções da aplicação pra facilitar no entendimento e na manutenção futura. Assim, a gente consegue diminuir muito o código que vai ficar dentro do nosso model e deixando nosso código bem limpo.

Sobre o serviço, agora vamos fazer o serviço para destruir o endpoint dentro da AWS.\
De novo na nossa pasta _sns_ vamos criar um arquivo, dessa vez chamado de _delete_endpoint.rb_. Dentro cole o código abaixo:
```ruby
module Sns
  class DeleteEndpoint 
    def initialize(sns_endpoint)
      @sns_endpoint = sns_endpoint
      @sns = Aws::SNS::Client.new
    end

    def call
      delete
    end

    private
    def delete
      @sns.delete_endpoint({
        endpoint_arn: @sns_endpoint.arn,
      })
    end
  end
end
```

Depois de todos os outros, esse é o mais simples de explicar, novamente nós vamos iniciar a classe recebendo o model e iniciando a classe do SNS. Depois, o método delete, vai chamar a função de delete do SDK.

### Criando o model SNS Endpoint
Enfim chegou o momento de criar o model. Já falamos muito sobre ele, mas agora vamos entender de fato qual é sua utilidade.\
Sempre que nós formos enviar uma push a gente vai precisar do ARN, e é para isso que esse model vai servir. Ele terá uma relação com o usuário, vai salvar o ARN e também o id do dispositivo.

Mão na massa, primeiro vamos gerar a migration. Em seu console digite `rails g model SnsEndpoint` para criar a migration e também o arquivo do model.

Abra a migration que foi gerada, será algo como `create_sns_endpoint{}.rb` e cole o código abaixo:
```ruby
class CreateSnsEndpoints < ActiveRecord::Migration[6.0]
  def change
    create_table :sns_endpoints do |t|
      t.string :arn
      t.string :device_id, null: false, unique: true
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
```
Explicando rapidamente, nós estamos definindo duas _strings_, a primeira é o _arn_ e a segunda é o _device_id_. Para o _device_id_ eu também defini que ele não pode ser nulo e que ele deve ser único. Para finalizar, nós definimos o _user_, que é uma relação com o nosso usuário, por isso defini que quero que também seja criada uma _foreign_key_.

### Configurando model SNS Endpoint
Agora vamos configurar nosso model de verdade.

Procure por _sns_endpoint.rb_ em _app/models/_ e cole o seguinte código:
```ruby
class SnsEndpoint < ApplicationRecord
  belongs_to :user

  validates :device_id, uniqueness: true
  validates_presence_of :device_id, :user

  before_create :create_aws_sns_endpoint
  before_destroy :delete_aws_sns_endpoint

  def send_push_notification(title, body)
    Sns::PushNotification.new(self, title, body).call
  end

  private
  def create_aws_sns_endpoint
    endpoint = Sns::CreateEndpoint.new(self).call

    self.arn = endpoint.endpoint_arn
  end

  def delete_aws_sns_endpoint
    Sns::DeleteEndpoint.new(self).call
  end
end
```

### Criando rota para enviar o token do dispositivo
```ruby
module Users
  class SnsEndpointController < UsersApplicationController
    before_action :set_sns_endpoint

    def register_device_id
      if (@sns_endpoint.present?)
        update
      else
        create
      end

      render json: "", status: 200
    end

    private
    def set_sns_endpoint
      @sns_endpoint = SnsEndpoint.find_by(sns_endpoint_params)
    end

    def update
      @sns_endpoint.update(user: @current_user)
    end

    def create
      SnsEndpoint.create(sns_endpoint_params.merge(user: @current_user))
    end

    def sns_endpoint_params
      params.permit(:device_id)
    end
  end
end
```

### Criando método para enviar a notificação para todos os dispositivos do usuário
```ruby
def send_push_notification(title, body)
  sns_endpoints.each do |sns_endpoint|
    sns_endpoint.send_push_notification(title, body)
  end
end
``



