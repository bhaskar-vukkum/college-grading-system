import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import { Product, Features, Moment, Faq, Footer } from '../components/Sections'

export default function Landing() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Product />
        <Features />
        <Moment />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
