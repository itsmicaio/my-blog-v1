import React from 'react'

import Layout from '../components/Layout/'
import SEO from '../components/seo'
import SocialLinks from '../components/SocialLinks'

import { MainContent } from '../styles/base'

const AboutPage = () => (
  <Layout>
    <SEO
      title="Sobre mim"
      description="Um resuminho da tragedória do grande Caio Fuzatto"
    />
    <MainContent>
      <h1>Sobre mim</h1>
      <p>
        Meu nome é Caio Fuzatto Mendonça, nascido em Vila Velha/ES, o famoso canela verde. Sou CO-Fundador, 
        Software Enginner e Solutions Arquitet na {' '}
        <a href="https://www.vilapps.com.br/" target="_blank" rel="noopener noreferrer">
          VilaApps
        </a>
        {' '}uma startup capixaba, que tem como objetivo entregar soluções em nuvem que facilitam a 
        vida do clientes.
      </p>

      <p>
        Comecei minha caminhada no mundo da programação em 2014, quando cansado de morrer no 
        PVP do Minecraft, decidi que queria ser criador de server. Foi amor ao primeiro plugin, 
        desde então programar é meu maior hobby.
      </p>

      <p>
        Antes de entrar na faculdade de Ciência da Computação, cursei um técnico em Logística, 
        que me fez além de muito mais organizado, ter certeza de que programar é era o que eu 
        queria pra minha vida, isso por que o curso tinha dois módulos de "TI", que ensinava VBA.
      </p>

      <p>
        Sou uma pessoa bem descontraída e positiva. Acredito na {' '}
        <a href="https://pt.wikipedia.org/wiki/Lei_da_atra%C3%A7%C3%A3o" target="_blank" rel="noopener noreferrer">
          lei da atração
        </a>
        {' '}e gosto de uma boa cerveja, de preferência um red ale. Esse blog eu fiz para compartilhar tudo do
        pouco que aprendi nesse mundo.
      </p>

      <h2>Um pouco das minhas habilidades</h2>

      <ul>
        <li>React Native / ReactJS / Redux</li>
        <li>Vasto conhecimento na nuvem da AWS</li>
        <li>Firebase e Amplify</li>
        <li>Javascript (Design Patterns, Testes, ES6/7)</li>
        <li>NodeJS</li>
        <li>Liderança e Gestão de projetos</li>
        <li>HTML e CSS</li>
        <li>Git</li>
        <li>Python</li>
        <li>Java</li>
        <li>Ruby / Rails</li>
        <li>Banco de dados SQL e NoSQL</li>
        <li>TDD e Continuous Integration</li>
        <li>Defensor do código limpo</li>
        <li>Desejo de aprender coisas novas</li>
      </ul>

      <h2>Contato</h2>

      <p>
        Você pode entrar em contato comigo através de qualquer uma das minhas
        redes sociais.
      </p>

      <SocialLinks hideStyle />
    </MainContent>
  </Layout>
)

export default AboutPage