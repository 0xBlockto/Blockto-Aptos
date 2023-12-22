'use client';

import { useState, useEffect, FC } from 'react';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Upload from '@/components/Upload';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useWallet } from "@aptos-labs/wallet-adapter-react";

type UploadedFile = {
  cid: string;
  name: string;
  fileType: 'image' | 'video';
};

const SignupPage: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState('');

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

  const handleSignUp = async () => {
    try {
      if (!account?.address) {
        console.log('Ethereum account is not available.');
        return;
      }

      const message = {
        statement: 'SignUp to Blockto using Petra Wallet',
        address: account.address,
        name: name,
        username: username,
        pfp: uploadedFiles[0].cid
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
        callbackUrl: '/'
      });
      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles([...uploadedFiles, file]);
  };

  const handleRemoveFile = (cid: string) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.cid !== cid)
    );
  };

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      username.trim() !== '' &&
      uploadedFiles.length > 0
    );
  };

  return (
    <div className="flex justify-center items-center h-screen" style={{ marginTop: '-5%' }}>
      <Card className="w-96">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            to Blockto
          </CardDescription>
        </CardHeader>
        <CardContent> 
          <div className="grid gap-2 mb-2">
            <Label>Name</Label>
            <Input
              autoFocus={true}
              type="text"
              className="input-bordered input-primary input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Username</Label>
            <Input
              autoFocus={true}
              type="text"
              className="input-bordered input-primary input w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-2">
          <div>
            <Label>Profile Picture</Label>
          </div>
          <div className="flex items-center space-x-2 mt-2 mb-4">
            <Upload
              onFileUpload={handleFileUpload}
              onError={(e) => setUploadError(e)}
            >
              <button
                className="btn btn-ghost btn-circle"
                onClick={(e) => e.preventDefault()}
              >
                <PaperClipIcon width={24} />
              </button>
            </Upload>
            {uploadedFiles.map((file) => (
              <div key={file.cid} className="flex items-center space-x-1">
                {file.fileType === 'image' ? (
                  <PhotoIcon width={20} />
                ) : (
                  <VideoCameraIcon width={20} />
                )}
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(file.cid)}
                  className="text-purple-500 hover:text-purple-600"
                >
                  <XMarkIcon width={14} />
                </button>
              </div>
            ))}
          </div>
          {uploadError && <p className="text-warning">{uploadError}</p>}
        </div>
        
          <Button className="w-full mb-2" onClick={handleSignUp} disabled={!isFormValid()}>
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
