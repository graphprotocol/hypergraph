import { Button } from '@/components/ui/button';
import { Project } from '@/schema';
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  usePublishToPublicSpace,
  useQuery,
  useSpace,
  useSpaces,
} from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/private-space/$space-id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { 'space-id': spaceId } = Route.useParams();

  return (
    <HypergraphSpaceProvider space={spaceId}>
      <PrivateSpace />
    </HypergraphSpaceProvider>
  );
}

function PrivateSpace() {
  const { name, ready, id: spaceId } = useSpace({ mode: 'private' });
  const { data: projects } = useQuery(Project, { mode: 'private' });
  const { data: publicSpaces } = useSpaces({ mode: 'public' });
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const createProject = useCreateEntity(Project);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { mutate: publishToPublicSpace, isPending } = usePublishToPublicSpace({
    onSuccess: () => alert('Project published to your public space'),
    onError: () => alert('Error publishing project to your public space'),
  });

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading space...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProject({ name: projectName, description: projectDescription });
    setProjectName('');
    setProjectDescription('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-600 mt-1 text-sm">Private Space</p>
          <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
          <p className="text-slate-600 mt-1 text-sm">ID: {spaceId}</p>
          <p className="text-muted-foreground mt-6">Manage your private projects and publish them to public spaces</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create Project Form */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Create New Project</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium text-card-foreground">
                    Project Name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="project-description" className="text-sm font-medium text-card-foreground">
                    Project Description
                  </label>
                  <input
                    id="project-description"
                    type="text"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Enter project description..."
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!projectName.trim()}>
                  Create Project
                </Button>
              </form>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Your Projects ({projects?.length || 0})
              </h2>

              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-border rounded-lg p-4 bg-background">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground">ID: {project.id}</p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label htmlFor="space" className="text-xs font-medium text-muted-foreground">
                            Select Public Space to Publish
                          </label>
                          <select
                            name="space"
                            value={selectedSpace}
                            onChange={(e) => setSelectedSpace(e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          >
                            <option value="">Choose a public space...</option>
                            {publicSpaces?.map((space) => (
                              <option key={space.id} value={space.id}>
                                {space.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          onClick={() => publishToPublicSpace({ entity: project, spaceId: selectedSpace })}
                          disabled={!selectedSpace || isPending}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Publish to Public Space
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-2">
                    <svg
                      className="mx-auto h-12 w-12 mb-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">No projects created yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first project using the form</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
