import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#c9a583" />
      </Head>
      <body className="bg-white text-gray-900 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
