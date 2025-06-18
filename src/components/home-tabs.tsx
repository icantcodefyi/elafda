"use client";

import { PostsList } from "~/components/posts/posts-list";
import { BrandAmbassadors } from "~/components/brand-ambassadors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export function HomeTabs() {
  return (
    <Tabs defaultValue="home" className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <BrandAmbassadors />
      </div>

      <TabsContent value="home" className="mt-0">
        <PostsList ranked={false} />
      </TabsContent>
      
      <TabsContent value="trending" className="mt-0">
        <PostsList ranked={true} />
      </TabsContent>
    </Tabs>
  );
} 