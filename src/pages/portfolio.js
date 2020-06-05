import React from "react"

import Layout from "../components/Layout"
import SEO from "../components/seo"
import PortfolioItem from '../components/PortfolioItem'

const portfolioList = [
    {
        id: "folha_vitoria",
        title: "Folha Vitória",
        year: "2020",
        description: `
            Criar o aplicativo do Jornal Folha Vitória foi uma grande tarefa, pois ja era um produto de sucesso,
            com muitos leitores, e nós precisavamos entregar um produto com qualidade e tão intuitivo quanto o
            portal. Ser o líder e desenvolvedor desse projeto geraram uma grande bagagem para minha vida
            profissional, e o app em React Native é um sucesso tanto quanto o portal web.
        `
    },
    {
        id: 'lift_bank',
        title: "LiftBank",
        year: "2019",
        description: `
            Partcipar do projeto do quick start do LiftBank, um banco voltado para empreendedores, foi algo inusitado
            na minha carreira. Nele eu basicamente "tombei" um app já existente na tecnologia Ionic para um novo 
            aplicativo em React Native, com um layout totalmente feito pelo equipe do Lift. Foi uma época de muita 
            experiencia, pois fiquei um período trabalhando no escritório do Lift, junto a equipe para finalizar o 
            projeto.
        `
    },
    {
        id: "omni_relprev",
        title: "Omni Relprev",
        year: "2018",
        description: `
            Omni Relprev é um sistema completo, Web Application feito em Rails com APIs que são consumidas
            por um app em React Native. Vencedor do prémio INOVANAC esse projeto tem como objetivo principal 
            prevenção de acidentes aéreos, por meio de relatórios criados pelos colaboradores da empresa.
        `
    },
    {
        id: "gdaproject",
        title: "Gerenciador de Armazém",
        year: "2016",
        description:    `
            Esse foi o meu primeiro produto como programador, foi desenvolvido em VBA 2010 utilizando um banco 
            de dados Windows Access. Esse foi o projeto do meu TCC (nota 10) no curso Técnico em Logística, 
            desenvolvido para ser utilizado pelos alunos nas aulas práticas dentro dos armazéns do SENAI.`
    }
]

const Portfolio = () => (
  <Layout>
    <SEO title="Portifólio" />
    {
        portfolioList.map(product =>
             <PortfolioItem 
                key={product.item}
                {...product}
             />
        )
    }
  </Layout>
)

export default Portfolio
