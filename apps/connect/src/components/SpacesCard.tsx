import { Loading } from '@/components/ui/Loading';
import type { PrivateSpaceData } from '@/hooks/use-private-spaces';
import type { PublicSpaceData } from '@/hooks/use-public-spaces';
import { cn } from '@/lib/utils';
import { Popover } from '@base-ui-components/react/popover';

interface SpacesCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  spaces: (PublicSpaceData | PrivateSpaceData)[];
  status?: 'loading' | { error: boolean | string } | undefined;
  selected?: Set<string>;
  onSelected?: (spaceId: string, selected: boolean) => void;
  currentAppId?: string;
}

export function SpacesCard({
  spaces,
  status,
  selected,
  onSelected,
  currentAppId,
  className,
  ...props
}: SpacesCardProps) {
  const error =
    typeof status === 'object' && 'error' in status
      ? typeof status.error === 'boolean'
        ? status.error
        : status.error || true
      : false;
  return (
    <div
      className={cn(
        `group/card c-card scroll-y scrollbar-none
        has-data-error:bg-error-dark
        has-data-error:text-error-light
        flex flex-col`,
        className,
      )}
      {...props}
    >
      <h2
        className={`
          c-card-title group-has-data-error/card:text-error-light sticky top-(--offset) shrink-0
          bg-[color-mix(in_oklab,var(--color-foreground)_calc(var(--progress)*0.25),transparent)]
          text-[color-mix(in_oklab,var(--color-background)_var(--progress),var(--color-foreground-muted))]
          backdrop-blur-sm
          [--progress:min(var(--scroll-y)/50*100%,100%)]
        `}
      >
        Spaces
      </h2>
      <div className="grid shrink-0 grow items-start">
        {(() => {
          if (status === 'loading') {
            return <Loading className="place-self-center" />;
          }
          if (error) {
            return (
              <p data-error className="place-self-center font-semibold">
                An error has occurred loading spaces{typeof error === 'string' ? `: ${error}` : ''}
              </p>
            );
          }
          if (spaces.length === 0) {
            return (
              <p data-empty className="text-foreground-muted place-self-center">
                No spaces found
              </p>
            );
          }
          return (
            <ul className="grid-cols-auto-fill-36 grid gap-4">
              {spaces.map((space) => {
                // Determine if space is selected
                const isPublicSpace = !('apps' in space);
                const isSelected = isPublicSpace ? true : (selected?.has(space.id) ?? false);
                const isDisabled =
                  !isPublicSpace && 'apps' in space && space.apps.some((app) => app.id === currentAppId);

                return (
                  <li key={space.id} className="group/list-item">
                    <Popover.Root openOnHover delay={50}>
                      <Popover.Trigger
                        className={`
                          group-nth-[5n]/list-item:bg-gradient-violet
                          group-nth-[5n+1]/list-item:bg-gradient-lavender
                          group-nth-[5n+2]/list-item:bg-gradient-aqua
                          group-nth-[5n+3]/list-item:bg-gradient-peach
                          group-nth-[5n+4]/list-item:bg-gradient-clearmint
                          flex aspect-video w-full items-end overflow-clip rounded-lg px-3 py-2
                          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                          ${isDisabled ? 'ring-2 ring-primary ring-offset-2 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        onClick={() => {
                          if (!isDisabled && onSelected) {
                            onSelected(space.id, !isSelected);
                          }
                        }}
                      >
                        <span className="text-sm leading-tight font-semibold">{space.name || space.id}</span>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Positioner side="bottom" sideOffset={12}>
                          <Popover.Popup className="c-popover">
                            <Popover.Arrow className="c-popover-arrow">
                              <ArrowSvg />
                            </Popover.Arrow>
                            {!('apps' in space) ? (
                              <Popover.Title className="font-semibold">Public space</Popover.Title>
                            ) : space.apps.length === 0 ? (
                              <Popover.Title className="font-semibold">
                                No app has access to this private space
                              </Popover.Title>
                            ) : (
                              <>
                                <Popover.Title className="font-semibold">
                                  Apps with access to this private space
                                </Popover.Title>
                                <Popover.Description>
                                  <ul className="list-disc">
                                    {space.apps.map((app) => (
                                      <li key={app.id}>{app.name || app.id}</li>
                                    ))}
                                  </ul>
                                </Popover.Description>
                              </>
                            )}
                          </Popover.Popup>
                        </Popover.Positioner>
                      </Popover.Portal>
                    </Popover.Root>
                  </li>
                );
              })}
            </ul>
          );
        })()}
      </div>
    </div>
  );
}

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" role="presentation" {...props}>
      <path d="M0 0L20 0L10 10Z" fill="currentColor" />
    </svg>
  );
}
