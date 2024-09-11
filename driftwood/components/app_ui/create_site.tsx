"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { invoke } from "@tauri-apps/api/tauri";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"

const templates = [{ label: "Default", value: "default" }] as const;

const formSchema = z.object({
  site_name: z.string().min(1).max(37),
  custom_domain: z.string().max(253),
  favicon_file: z.string(),
  template: z.string().min(1),
  password_enabled: z.boolean().default(false),
  rss_enabled: z.boolean().default(false),
  github_enabled: z.boolean().default(false),
});

export default function CreateSite() {

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      custom_domain: "",
      favicon_file: "",
      template: "default",
      password_enabled: false,
      rss_enabled: false,
      github_enabled: false,
    },
  });

  const create_site = async (new_site: any) => {
    console.log("creating new site");
    const newSite = JSON.stringify(new_site);
    console.log(newSite);
    try {
      console.log("trying");
      const response = await invoke<string>("create_site",{newSite:newSite});
      console.log("Sites response:", response);
      if (!response || response === '') {
        return;
      }
      const sites_elemnt = document.getElementById('sites');
      if (sites_elemnt) {
        sites_elemnt.innerHTML = response;
      }
    } catch (err) {
      console.error("error");
      console.error(err);
    } finally {
    }
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    create_site(values);
    // this is the object we're expecting from the form
    // {
    //   custom_domain: "domain.com",
    //   favicon_file: "C:\file.ico",
    //   github_enabled: false,
    //   password_enabled: false,
    //   rss_enabled: false,
    //   site_name: "name",
    //   tempalte: "default"
    // }
    // site_name: needs to be unique, Netlify will handle validation.
  }

  return (
    <div>
      <h1 className="text-4xl pb-2">Create a new site</h1>
      <div className="pb-10 dark">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site name</FormLabel>
                  <FormControl>
                    <Input placeholder="awesome blog" {...field} />
                  </FormControl>
                  <FormDescription>
                    The site name determines the default URL for your site.
                    <br />
                    Only alphanumeric characters and hyphens are allowed with a
                    total character limit of 37.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom domain</FormLabel>
                  <FormControl>
                    <Input placeholder="yourdomain.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    A custom domain name that you own. Total character limit of
                    253.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="favicon_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="C:\Users\you\images\awesome_icon.ico"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The favicon (little icon that goes in the browser&amp;s tab)
                    for your site.
                    <br />
                    <a
                      className="underline"
                      href="https://webflow.com/blog/favicon-guide?msockid=1f60439f880f613f1747576c89a66046"
                    >
                      Click here for an article explaining favicons.
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Template</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? templates.find(
                              (template) => template.value === field.value
                            )?.label
                            : "Select template"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {templates.map((template) => (
                              <CommandItem
                                value={template.label}
                                key={template.value}
                                onSelect={() => {
                                  form.setValue("template", template.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    template.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {template.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the template that will be used to create the site.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Password enabled
                    </FormLabel>
                    <FormDescription>
                      Turn this on to require visitors to use a password to enter your site.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rss_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      RSS enabled
                    </FormLabel>
                    <FormDescription>
                      Turn this on to add an RSS feed to your website.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Github enabled
                    </FormLabel>
                    <FormDescription>
                      Turn this on to connect your site to a Github repo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
