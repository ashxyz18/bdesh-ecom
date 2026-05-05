"use client"

import { useEffect, useState } from "react"
import type { StoreTemplateProps } from "../types"
import type { TemplateConfig } from "./types"
import { useTemplateTheme } from "./hooks/useTemplateTheme"
import { ConfigNavbar } from "./components/ConfigNavbar"
import { ConfigFooter } from "./components/ConfigFooter"
import { ScrollToTop } from "./components/ScrollToTop"
import { ConfigHomePage } from "./pages/ConfigHomePage"
import { ConfigProductPage } from "./pages/ConfigProductPage"
import { ConfigCollectionPage } from "./pages/ConfigCollectionPage"
import { ConfigCartPage } from "./pages/ConfigCartPage"
import { ConfigCheckoutPage } from "./pages/ConfigCheckoutPage"
import { ConfigAuthPages } from "./pages/ConfigAuthPages"
import { ConfigWishlistPage } from "./pages/ConfigWishlistPage"
import { ConfigSearchPage } from "./pages/ConfigSearchPage"

interface ConfigTemplateProps {
  config: TemplateConfig
  store: StoreTemplateProps["store"]
  path: string[]
}

export default function ConfigTemplate({ config, store, path = [] }: ConfigTemplateProps) {
  const theme = useTemplateTheme(config)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const page = path[0] || ""
  const subpath = path.slice(1).join("/")

  const formatPrice = (price: number) => {
    return "৳" + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const storeLink = (subpath: string) => {
    const base = `/store?store=${store.subdomain}`
    return subpath ? `${base}&path=${subpath}` : base
  }

  const renderPage = () => {
    switch (page) {
      case "product":
        return <ConfigProductPage config={config} store={store} slug={subpath} formatPrice={formatPrice} storeLink={storeLink} />
      case "collection":
        return <ConfigCollectionPage config={config} store={store} slug={subpath} formatPrice={formatPrice} storeLink={storeLink} />
      case "cart":
        return <ConfigCartPage config={config} store={store} formatPrice={formatPrice} storeLink={storeLink} />
      case "checkout":
        return <ConfigCheckoutPage config={config} store={store} formatPrice={formatPrice} storeLink={storeLink} />
      case "login":
        return <ConfigAuthPages config={config} store={store} page="login" storeLink={storeLink} />
      case "register":
        return <ConfigAuthPages config={config} store={store} page="register" storeLink={storeLink} />
      case "account":
        return <ConfigAuthPages config={config} store={store} page="account" storeLink={storeLink} />
      case "wishlist":
        return <ConfigWishlistPage config={config} store={store} formatPrice={formatPrice} storeLink={storeLink} />
      case "search":
        return <ConfigSearchPage config={config} store={store} formatPrice={formatPrice} storeLink={storeLink} />
      default:
        return <ConfigHomePage config={config} store={store} formatPrice={formatPrice} storeLink={storeLink} />
    }
  }

  const scopeClass = `tpl-${config.id || "default"}`

  return (
    <div className={`min-h-screen bg-[var(--tpl-bg)] ${scopeClass}`} style={mounted ? theme.cssVars as React.CSSProperties : undefined}>
      <style>{`
        :root {
          ${Object.entries(theme.cssVars).map(([k, v]) => `${k}: ${v};`).join("\n")}
        }
      `}</style>
      {config.customCss && <style>{`.${scopeClass} { ${config.customCss} }`}</style>}
      <ConfigNavbar config={config} store={store} />
      {renderPage()}
      <ConfigFooter config={config} store={store} />
      <ScrollToTop />
    </div>
  )
}
