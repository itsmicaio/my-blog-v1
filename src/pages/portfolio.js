import React from "react"

import Layout from "../components/Layout"
import SEO from "../components/seo"
import PortfolioItem from '../components/PortfolioItem'

import * as S from '../components/ListWrapper/styled'

const portfolioList = [
    {
        id: "folha_vitoria",
        title: "Folha Vitória",
        year: "2020",
        image: "icon.png",
        description: `
            Desenvolver o aplicativo do Jornal Folha Vitória foi uma grande tarefa, pois ja era um produto de sucesso,
            com muitos leitores, e nós precisavamos entregar um produto com qualidade e tão intuitivo quanto o
            portal. Ser o líder e desenvolvedor desse projeto geraram uma grande bagagem para minha vida
            profissional, e o app em React Native é um sucesso tanto quanto o portal web.
        `
    },
    {
        id: 'lift_bank',
        title: "LiftBank",
        year: "2019",
        image: "icon.png",
        description: `
            Na LiftBank o trabalho foi simples: transformar uma aplicação feita em Ionic para React Native.
            Ajudar no MVP de um banco voltado para empreendedores, foi uma época de muita experiencia na 
            minha carreira, pois fiquei um período trabalhando no escritório do Lift, junto a equipe para 
            finalizarmos o projeto, e pude não só trocar algumas experiéncias como também conhecer um pouco
            do coração de um banco digital.
        `
    },
    {
        id: "omni_relprev",
        title: "Omni Relprev",
        year: "2018",
        image: "icon.png",
        description: `
            Omni Relprev é um sistema completo, Web Application feito em Rails com APIs que são consumidas
            por um app em React Native. Vencedor do prémio INOVANAC esse projeto tem como objetivo principal 
            a prevenção de acidentes aéreos, por meio de relatórios criados pelos colaboradores e clientes
            da empresa.
        `
    },
    {
        id: "gdaproject",
        title: "Gerenciador de Armazém",
        year: "2016",
        image: "icon.png",
        description:    `
            Apesar de ser um projeto simples, esse sistema para windows, foi motivo de muito orgulho para
            mim. Utilizei as tecnologias Visual Basic 2010 com um banco de dados local doWindows Access, o GDA
            foi desenvolvido como projeto do meu TCC  no curso Técnico em Logística oferecido pelo SENAI, feito 
            para ser utilizado nas aulas práticas dentro dos armazéns do SENAI.`
    }
]

const Portfolio = () => (
  <Layout>
    <SEO title="Portifólio" />
    <S.ListWrapper>
        {
            portfolioList.map((product, index) =>
                <PortfolioItem 
                    key={product.item}
                    right={(index % 2) != 0}
                    left={(index % 2) === 0}
                    {...product}
                />
            )
        }
    </S.ListWrapper>
  </Layout>
)

export default Portfolio
