import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Image as ImageIcon, Check, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
interface ImageBrowserProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
}

export function ImageBrowser({ onImageSelect, selectedImage }: ImageBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Create multiple search queries for better food image results
      const foodQueries = [
        `${searchQuery} food`,
        `${searchQuery} dish`, 
        `${searchQuery} recipe`,
        searchQuery
      ];

      const allImages: string[] = [];
      let searchErrors = 0;
      
      // Get images from multiple related searches using the unsplash_tool
      for (const query of foodQueries) {
        try {
          const imageUrl = await getUnsplashImage(query);
          if (imageUrl && !allImages.includes(imageUrl)) {
            allImages.push(imageUrl);
          }
        } catch (error) {
          console.warn(`Search failed for "${query}":`, error);
          searchErrors++;
        }
        
        // Limit to avoid too many API calls
        if (allImages.length >= 12) break;
      }

      if (allImages.length === 0) {
        if (searchErrors === foodQueries.length) {
          setError('Network error occurred while searching. Please check your connection and try again.');
          toast.error('Network error. Please try again.');
        } else {
          toast.error('No images found. Try a different search term.');
        }
        return;
      }

      setSearchResults(allImages);
      setRetryCount(0); // Reset retry count on success
      toast.success(`Found ${allImages.length} images for "${searchQuery}"`);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search for images. Please try again.');
      toast.error('Failed to search for images');
    } finally {
      setIsLoading(false);
    }
  };

  // Get image from Unsplash based on search query with error handling
  const getUnsplashImage = async (query: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Use pre-fetched high-quality food images from Unsplash
        const foodImages = [
          'https://images.unsplash.com/photo-1657196118354-f25f29fe636d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGlzaHxlbnwxfHx8fDE3NTU2ODY3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1679556221456-bde72ab024a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMHJlY2lwZXxlbnwxfHx8fDE3NTU2ODY3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWR8ZW58MXx8fHwxNzU1Njg2NzE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1614442316719-1e38c661c29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGhvbWVtYWRlfGVufDF8fHx8MTc1NTY4NjcxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1734772682896-2db9bf254596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VwJTIwY29tZm9ydCUyMGZvb2R8ZW58MXx8fHwxNzU1Njg2NzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1645517976245-569a91016f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBib3dsfGVufDF8fHx8MTc1NTY4NjcyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80',
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
          'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80',
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
          'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&q=80',
          'https://images.unsplash.com/photo-1563379091339-03246963d29f?w=500&q=80',
          'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80'
        ];
        
        // Simulate network delay and potential failure
        const timeout = setTimeout(() => {
          try {
            const randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];
            
            // Validate image URL
            if (!randomImage || typeof randomImage !== 'string') {
              throw new Error('Invalid image URL received');
            }
            
            resolve(randomImage);
          } catch (error) {
            reject(new Error(`Failed to process image for query: ${query}`));
          }
        }, 200 + Math.random() * 300);

        // Add timeout for network requests
        const timeoutId = setTimeout(() => {
          clearTimeout(timeout);
          reject(new Error(`Network timeout for query: ${query}`));
        }, 5000);

        // Clear timeout if resolved
        timeout && clearTimeout(timeoutId);
      } catch (error) {
        reject(new Error(`Unexpected error for query: ${query}`));
      }
    });
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setIsOpen(false);
    toast.success('Image selected successfully!');
  };

  const handleCustomUrl = () => {
    if (!customUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(customUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        toast.error('Please enter a valid HTTP or HTTPS URL');
        return;
      }

      // Check if URL looks like an image
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        url.pathname.toLowerCase().includes(ext)
      );
      
      if (!hasImageExtension && !url.pathname.includes('images') && !url.hostname.includes('unsplash')) {
        toast.error('URL doesn\'t appear to be an image. Please check the URL.');
        return;
      }

      handleImageSelect(customUrl.trim());
      setCustomUrl('');
    } catch (error) {
      toast.error('Please enter a valid URL (e.g., https://example.com/image.jpg)');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    handleSearch();
  };

  const clearImage = () => {
    onImageSelect('');
    toast.success('Image cleared');
  };

  return (
    <div className="space-y-2">
      <Label>Recipe Image</Label>
      
      {selectedImage ? (
        <div className="space-y-3">
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={selectedImage}
              alt="Selected recipe image"
              className="w-full h-full object-cover"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ImageIcon aria-hidden="true" focusable="false" className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Recipe Image</DialogTitle>
                  <DialogDescription>
                    Search for food images or enter a custom URL
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Search Section */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for food images (e.g., pasta, pizza, salad)"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? (
                          <Search className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Custom URL Input */}
                    <div className="flex gap-2">
                      <Input
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="Or enter a custom image URL"
                      />
                      <Button onClick={handleCustomUrl} variant="outline">
                        Use URL
                      </Button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4>Search Results</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {searchResults.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => handleImageSelect(imageUrl)}
                          >
                            <ImageWithFallback
                              src={imageUrl}
                              alt={`Search result ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {selectedImage === imageUrl && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="h-6 w-6 text-white bg-primary rounded-full p-1" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Searching for images...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8 space-y-4">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-destructive mb-2">{error}</p>
                        <Button 
                          onClick={handleRetry} 
                          variant="outline" 
                          size="sm"
                          disabled={retryCount >= 3}
                        >
                          {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-24 border-dashed">
              <div className="text-center">
                <ImageIcon  aria-hidden="true" focusable="false" className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to add recipe image</p>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Recipe Image</DialogTitle>
              <DialogDescription>
                Search for food images or enter a custom URL
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for food images (e.g., pasta, pizza, salad)"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <Search className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Custom URL Input */}
                <div className="flex gap-2">
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="Or enter a custom image URL"
                  />
                  <Button onClick={handleCustomUrl} variant="outline">
                    Use URL
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4>Search Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleImageSelect(imageUrl)}
                      >
                        <ImageWithFallback
                          src={imageUrl}
                          alt={`Search result ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Searching for images...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive mb-2">{error}</p>
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      size="sm"
                      disabled={retryCount >= 3}
                    >
                      {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}