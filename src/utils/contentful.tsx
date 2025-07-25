import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import React from "react";

export const contentfulClient = createClient({
  space: "xw6vkrijm89x",
  accessToken: "LnhM-VyGWCplfg4FdkdPC6uj8ZNqQCI0ZPvbH2_tg88",
});

export const getContentfulEntries = (
  ...args: Parameters<typeof contentfulClient.getEntries>
) => {
  const [options = {}, ...rest] = args;
  const withDefaultOptions: typeof options = { include: 10, ...options };
  return contentfulClient.getEntries(withDefaultOptions, ...rest);
};

type DocToReactComponentsArgs = Parameters<typeof documentToReactComponents>;

/**
 * Display any instance of 'Het Belangenatelier' (case insensitive) in a different font
 */
function replaceText(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') {
    return node.split(/(Het belangenatelier)/i).map((part, index) =>
      /het belangenatelier/i.test(part)
        ? <span key={index} className="special-font-family">Het BelangenAtelier</span>
        : part
    );
  }

  if (React.isValidElement(node)) {
    return React.cloneElement(node, {
      ...node.props,
      children: React.Children.map(node.props.children, replaceText)
    });
  }

  return node;
}

export const renderContentful = (content?: DocToReactComponentsArgs[0], options?: DocToReactComponentsArgs[1]) => {
  const withDefaultOptions: typeof options = {
    ...options,
    renderNode: {
      [INLINES.ASSET_HYPERLINK]: (node, children) => {
        return <a href={`https:${node.data.target.fields.file.url}`} download>{children}</a>
      },
      [BLOCKS.EMBEDDED_ASSET]: (node, _children) => {
        return (
          <img
            src={`https://${node.data.target.fields.file.url}`}
            alt={node.data.target.fields.description}
          />
        );
      },
      [BLOCKS.PARAGRAPH]: (_node, children) => {
        return <p>{React.Children.map(children, replaceText)}</p>
      },
      ...options?.renderNode
    }
  };
  return documentToReactComponents(content || '' as any, withDefaultOptions);
}

