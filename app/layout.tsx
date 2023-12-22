'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Link from 'next/link'
const inter = Inter({ subsets: ['latin'] })
import { ModeToggle } from '@/components/dropdown'
import { ChevronRight, Droplets, LogOut } from "lucide-react"
import { Button } from '@/components/ui/button'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { SessionProvider, getCsrfToken, signIn, signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import Image from 'next/image';

const AptosWallets = [new PetraWallet()];

function AppWithProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

function Nav() {
  const pathname = usePathname()
  const router = useRouter();
  const { data: session } = (useSession() || {}) as any;

  const {
    connect,
    account,
    network,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  } = useWallet();

  const onConnect = async (walletName) => {
    await connect(walletName);
  };

  const handleSignIn = React.useCallback(async () => {
    try {
      if (!account?.address) {
        console.log('Aptos account is not available.');
        return;
      }

      // const userResponse = await fetch(`/api/user/${account.address}`);
      const userResponse = await fetch(`http://localhost:3001/api/user/${account.address}`);
      if (userResponse.status === 404) {
        router.push('/signup');
        return;
      }

      const message = {
        statement: 'SignIn to Blockto using Petra Wallet',
        address: account.address
      }

      const payload = {
        message: JSON.stringify(message),
        nonce: await getCsrfToken() as string
      };

      const signResponse = await signMessageAndVerify(payload);
      if (!signResponse) {
        console.log('Signature verification failed!');
        return;
      }

      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        callbackUrl: '/',
      });
      
    } catch (error) {
      console.log(error);
    }
  }, [account?.address, router]);

  const handleSignOut = async () => {
    disconnect();
    await signOut({ redirect: false, callbackUrl: '/' });
  };

  return (
    <nav className='
    border-b flex
    flex-col sm:flex-row
    items-start sm:items-center
    sm:pr-10
    '>
      <div
        className='py-3 px-8 flex flex-1 items-center p'
      >
        <Link href="/" className='mr-5 flex items-center'>
          {/* <Droplets className="opacity-85" size={19} /> */}
          <Image
            src="/icon128.png"
            alt="Blockto Icon"
            width={28}
            height={28}
            className="rounded-full"
          />
          <p className={`ml-2 mr-4 text-lg font-semibold`}>Blockto</p>
        </Link>
        <Link href="/" className={`mr-5 text-sm ${pathname !== '/' && 'opacity-50'}`}>
          <p>Home</p>
        </Link>
        <Link href="/search" className={`mr-5 text-sm ${pathname !== '/search' && 'opacity-60'}`}>
          <p>Search</p>
        </Link>
      </div>
      <div className='
        flex
        sm:items-center
        pl-8 pb-3 sm:p-0
      '>
        <div className='mr-3'>
          <WalletSelector />
        </div>
        {
          !session && account?.address && (
            <Button onClick={handleSignIn} variant="secondary" className="mr-4">
              Sign In
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
        }
        {
          session && (
            <Button onClick={handleSignOut} variant="secondary" className="mr-4">
              Sign out
              <LogOut className="h-4 w-4 ml-3" />
            </Button>
          )
        }
        <ModeToggle />
      </div>
    </nav>
  )
}

export default function RootLayout({ children, session, ...props }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <SessionProvider>
      <AptosWalletAdapterProvider plugins={AptosWallets} autoConnect={true}>
        <AppWithProviders {...props}>
          <Nav />
          {mounted && children}
        </AppWithProviders>
      </AptosWalletAdapterProvider>
    </SessionProvider>
  )
}
