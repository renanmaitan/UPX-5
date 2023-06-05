import React from "react"
import styles from '../styles/Home.module.css'

import planta1 from '../public/assets/planta1.svg'
import planta2 from '../public/assets/planta2.svg'
import planta3 from '../public/assets/planta3.svg'

import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1>BotanicCare</h1>
          <h3>Cuidado que suas plantas precisam</h3>
        </div>
        <div className={styles.button}>
          <Link href="/forms">
            <button>
              Registrar planta
            </button>
          </Link>
          <Link href="/planta">
            <button>
              Iniciar sistema
            </button>
          </Link>
        </div>
      </div>
      <div className={styles.image}>
        <div className={styles.planta1}>
          <Image
            src={planta1}
            alt='planta'
            width="100%"
            height="100%"
          />

        </div>
        <div className={styles.planta2}>
          <Image
            src={planta2}
            alt='planta'
            width="100%"
            height="100%"
          />

        </div>
        <div className={styles.planta3}>
          <Image
            src={planta3}
            alt='planta'
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}
