import Image from "next/image"
import Link from "next/link"
import DefaultLayout from "@/components/DefaultLayout"
import Button from "@/components/Button"
import styles from "./page.module.scss"

function LandingBriefContent() {
    return (
        <div className={styles.landing__briefContent}>
            <h1 className={styles.landing__briefHeading}>Tileio</h1>
            <p className={styles.landing__briefSubheading}>
                Create your ideal{' '}
                <span className={styles.landing__briefSynonyms}>control panel</span>
            </p>
            <p className={styles.landing__briefSubheading}>with few simple clicks.</p>
            <Link className={styles.landing__briefLoginA} href="/login">
                <Button className={styles.landing__briefLogin}>
                    <div>Start using now</div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path d="m12 20-1.425-1.4 5.6-5.6H4v-2h12.175l-5.6-5.6L12 4l8 8Z"></path>
                    </svg>
                </Button>
            </Link>
        </div>)
}

export default function Home() {
    return (
        <DefaultLayout>
            <section className={styles.landing}>
                <div className={styles.landing__imageWrapper}>
                    <Image className={styles.landing__image} src="/home/landing-page.png" width={1120} height={500} alt="Landing Page Image"/>
                </div>
                <div className={styles.landing__brief}>
                    <div className={styles.landing__briefContentWrapper}>
                        <LandingBriefContent/>
                    </div>
                    <div className={styles.landing__briefTriangle}></div>
                </div>
            </section>
            <section className={styles.landingMobile}>
                <div className={styles.landingMobile__imgWrapper}>
                    <Image src="/home/landing-mobile-page.png" width={500} height={600} className={styles.landingMobile__img} alt="Example Grid"/>
                </div>
                <div className={styles.landingMobile__briefWrapper}>
                    <LandingBriefContent/>
                </div>
                <Image src="/home/wave.png" className={styles.landingMobile__wave} width={600} height={30} alt="wave"/>
            </section>
            <section>
                <div className={styles.advantages}>
                    <div className={styles.advantages__advantage}>
                        <Image src="/home/easy-to-use.png" width={496} height={496} className={styles.advantages__img} alt="Easy to use"/>
                        <div className={styles.advantages__text}>
                            <h1 className={styles.advantages__h1}>Easy to use</h1>
                            Just login, add any cells you want and begin to use!
                        </div>
                    </div>
                    <div className={styles.advantages__advantage}>
                        <div className={styles.advantages__text}>
                            <h1 className={styles.advantages__h1}>Highly customizable</h1>
                            In the Tileio app you can customize almost everything like colors, sizes, urls etc.
                            And even <Link href="/api-docs">create your own cells</Link>!
                        </div>
                        <Image src="/home/highly-customizable.png" width={496} height={496} className={styles.advantages__img} alt="Highly customizable"/>
                    </div>
                    <div className={styles.advantages__advantage}>
                        <Image src="/home/developer-friendly.png" width={496} height={496} className={styles.advantages__img} alt="Developer friendly"/>
                        <div className={styles.advantages__text}>
                            <h1 className={styles.advantages__h1}>Developer friendly</h1>
                            With the help of our <Link href="/api-docs">APIs</Link> you can easily create your dream cell. Dynamic
                            cells are loaded in iframes so you only need to know HTML, CSS &amp; JS to begin.
                        </div>
                    </div>
                </div>
            </section>
        </DefaultLayout>
    )
}
