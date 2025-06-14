import React, { type JSX } from "react";

export interface Skill {
  name: string;
  icon: JSX.Element;
}

export const skills: Skill[] = [
  {
    name: 'C',
    icon: React.createElement('i', { className: 'devicon-c-plain' })
  },
  {
    name: 'Python',
    icon: React.createElement('i', { className: 'devicon-python-plain ' })
  },
  {
    name: 'JavaScript',
    icon: React.createElement('i', { className: 'devicon-javascript-plain ' })
  },
  {
    name: 'React Native',
    icon: React.createElement('i', { className: 'devicon-react-original ' })
  },
  {
    name: 'Flutter',
    icon: React.createElement('i', { className: 'devicon-flutter-plain ' })
  },
  {
    name: "AWS",
    icon: React.createElement('i', { className: 'devicon-amazonwebservices-original colored' })
  },
  {
    name: 'OpenAI',
    icon: React.createElement('span', { style: { fontSize: '20px', color: 'white' } }, '🤖')
  },
  {
    name: 'Flutter',
    icon: React.createElement('i', { className: 'devicon-flutter-plain ' })
  },
  {
    name: "AWS",
    icon: React.createElement('i', { className: 'devicon-amazonwebservices-original colored' })
  },
  {
    name: 'OpenAI',
    icon: React.createElement('span', { style: { fontSize: '20px', color: 'white' } }, '🤖')
  },

];
