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

Em sua pasta services (se não tem uma pasta services em seu projeto, adicione em _/app_) crie uma nova pasta chamada _sns_ e logo em seguida crie dentro de _/sns_ um arquivo chamado "push_notification.rb". No final, o caminho para seu arquivo será "app/services/sns/push_notification"

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

### Terceiro serviço: destruidor de endpoint
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

### Criando o model SNS Endpoint

```ruby
class CreateSnsEndpoints < ActiveRecord::Migration[6.0]
  def change
    create_table :sns_endpoints do |t|
      t.string :arn
      t.string :device_id, null: false, unique: true
      t.references :user, foreign_key: true
      t.references :postman, foreign_key: true

      t.timestamps
    end
  end
end
```

### Configurando model SNS Endpoint
```ruby
class SnsEndpoint < ApplicationRecord
  belongs_to :postman, optional: true
  belongs_to :user, optional: true

  validates :device_id, uniqueness: true
  validates_presence_of :device_id

  validate :validate_presence_of_user_or_postman

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

  def validate_presence_of_user_or_postman
    unless ( user.present? || postman.present? )
      errors.add(:user, I18n.t("errors.messages.blank"))
    end
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



