"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Search, Star, Clock, User, Eye } from "lucide-react"

// Mock data for e-lafdas - you can replace this with real data
const mockELafdas = [
  {
    id: "1",
    title: "The Great Debate of 2024",
    description: "A heated discussion about the future of web development frameworks",
    author: "TechGuru42",
    createdAt: "2024-01-15",
    views: 1250,
    stars: 89,
    category: "Technology",
    isHot: true,
  },
  {
    id: "2",
    title: "Coffee vs Tea: The Ultimate Lafda",
    description: "Which beverage reigns supreme? The community speaks out!",
    author: "CaffeineAddict",
    createdAt: "2024-01-10",
    views: 856,
    stars: 42,
    category: "Lifestyle",
    isHot: false,
  },
  {
    id: "3",
    title: "Remote Work Productivity Hacks",
    description: "Controversial opinions about working from home that sparked major discussion",
    author: "WorkFromHomeWizard",
    createdAt: "2024-01-08",
    views: 2341,
    stars: 156,
    category: "Career",
    isHot: true,
  },
  {
    id: "4",
    title: "The Pineapple Pizza Controversy",
    description: "Does pineapple belong on pizza? This lafda divided the internet",
    author: "FoodCritic99",
    createdAt: "2024-01-05",
    views: 1789,
    stars: 73,
    category: "Food",
    isHot: false,
  },
]

interface ELafdaDirectoryProps {
  className?: string
}

export function ELafdaDirectory({ className }: ELafdaDirectoryProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredELafdas = mockELafdas.filter((lafda) => {
    const matchesSearch = lafda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lafda.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className={className}>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search e-lafdas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* E-Lafdas Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredELafdas.map((lafda) => (
          <Card key={lafda.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {lafda.title}
                    {lafda.isHot && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        🔥 Hot
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">
                    {lafda.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Author and Date */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{lafda.author}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(lafda.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{lafda.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      <span>{lafda.stars}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {lafda.category}
                  </span>
                </div>

                {/* Action Button */}
                <Button className="w-full" variant="outline">
                  View Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredELafdas.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No e-lafdas found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
        </div>
      )}

      {/* Load More Section */}
      {filteredELafdas.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More E-Lafdas
          </Button>
        </div>
      )}
    </div>
  )
} 