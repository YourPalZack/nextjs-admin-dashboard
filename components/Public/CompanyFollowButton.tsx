'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CompanyFollowButtonProps {
  companyId: string;
  companyName: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export default function CompanyFollowButton({
  companyId,
  companyName,
  variant = 'outline',
  size = 'default',
}: CompanyFollowButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if following in localStorage
    const followedCompanies = JSON.parse(
      localStorage.getItem('followedCompanies') || '[]'
    );
    setIsFollowing(followedCompanies.includes(companyId));
  }, [companyId]);

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to follow companies and receive job alerts.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const followedCompanies = JSON.parse(
        localStorage.getItem('followedCompanies') || '[]'
      );

      if (isFollowing) {
        // Unfollow
        const updated = followedCompanies.filter((id: string) => id !== companyId);
        localStorage.setItem('followedCompanies', JSON.stringify(updated));
        setIsFollowing(false);
        
        toast({
          title: 'Unfollowed',
          description: `You'll no longer receive alerts from ${companyName}.`,
        });
      } else {
        // Follow
        followedCompanies.push(companyId);
        localStorage.setItem('followedCompanies', JSON.stringify(followedCompanies));
        setIsFollowing(true);
        
        toast({
          title: 'Following!',
          description: `You'll be notified when ${companyName} posts new jobs.`,
        });
      }

      // In a real app, this would sync with the backend
      // await api.post('/api/companies/follow', { companyId, action: isFollowing ? 'unfollow' : 'follow' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}