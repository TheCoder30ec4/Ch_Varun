import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mail, Github, Linkedin, Heart } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Feel free to reach out to me for collaboration, project ideas, or just a tech chat!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a href="mailto:varun30ec4@gmail.com">
                  varun30ec4@gmail.com
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
                  <Github className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg">GitHub</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a href="https://github.com/TheCoder30ec4" target="_blank" rel="noreferrer">
                  TheCoder30ec4
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
                  <Linkedin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg">LinkedIn</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a href="https://linkedin.com/in/ch-varun" target="_blank" rel="noreferrer">
                  Ch Varun
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-8 border-t">
          <p className="text-gray-600 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>and passion by Varun</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;